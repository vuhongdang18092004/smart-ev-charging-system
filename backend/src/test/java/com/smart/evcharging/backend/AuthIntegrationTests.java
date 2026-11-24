package com.smart.evcharging.backend;

import com.smart.evcharging.backend.common.exception.CustomBusinessException;
import com.smart.evcharging.backend.common.exception.AuthDeliveryException;
import com.smart.evcharging.backend.dto.request.AuthRequests.*;
import com.smart.evcharging.backend.dto.response.AuthSessionResponse;
import com.smart.evcharging.backend.service.AuthService;
import java.net.URI;
import java.net.http.*;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.concurrent.Executors;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@EnabledIfEnvironmentVariable(named = "AUTH_INTEGRATION_TEST", matches = "true")
class AuthIntegrationTests {
    @Autowired AuthService auth;
    @MockitoBean JavaMailSender mail;
    @Autowired JdbcClient jdbc;
    @Value("${spring.datasource.url}") String jdbcUrl;
    @Value("${spring.datasource.username}") String jdbcUser;
    @Value("${spring.datasource.password}") String jdbcPassword;
    @Value("${local.server.port}") int port;

    @Test
    void driverOtpRotationReplayAndLogout() throws Exception {
        String email = UUID.randomUUID() + "@example.test";
        String password = "test-fixture-password";
        auth.register(new Registration("Fixture Driver", email, password));
        assertBusinessCode("error.email-verification-required", () -> auth.login(new Login(email, password, "mobile")));
        auth.resend(email);
        String code = capturedCode();
        String wrong = code.equals("123456") ? "654321" : "123456";
        assertBusinessCode("error.invalid-otp", () -> auth.verify(new Verification(email, wrong)));
        auth.verify(new Verification(email, code));
        assertBusinessCode("error.invalid-otp", () -> auth.verify(new Verification(email, code)));
        assertBusinessCode("error.account-disabled", () -> auth.login(new Login(email, password, "web")));

        AuthSessionResponse login = auth.login(new Login(email, password, "mobile"));
        assertEquals(200, get("/api/auth/me", login.accessToken()));
        assertEquals(403, get("/api/vehicles-infor", login.accessToken()));
        AuthSessionResponse rotated = auth.refresh(new Refresh(login.refreshToken(), "mobile"));
        assertNotEquals(login.refreshToken(), rotated.refreshToken());
        assertBusinessCode("error.invalid-session", () -> auth.refresh(new Refresh(login.refreshToken(), "mobile")));
        assertEquals(401, get("/api/auth/me", rotated.accessToken()));

        AuthSessionResponse independent = auth.login(new Login(email, password, "mobile"));
        auth.logout(new Refresh(independent.refreshToken(), "mobile"));
        assertEquals(401, get("/api/auth/me", independent.accessToken()));
    }

    @Test
    void operatorInvitationAndPasswordRecovery() throws Exception {
        String email = UUID.randomUUID() + "@example.test";
        auth.invite(new Invitation("Fixture Operator", email));
        String code = capturedCode();
        auth.reset(new Reset(email, code, "fixture-password-one"));
        AuthSessionResponse session = auth.login(new Login(email, "fixture-password-one", "web"));
        assertEquals("operator", session.user().role());
        assertBusinessCode("error.invalid-otp", () -> auth.reset(new Reset(email, code, "fixture-password-two")));
        UUID brand = jdbc.sql("insert into brands(name) values(?) returning id")
                .param("Fixture " + UUID.randomUUID()).query(UUID.class).single();
        UUID another = jdbc.sql("insert into users(name,email,password_hash,role) values(?,?,?,?) returning id")
                .params("Other", UUID.randomUUID() + "@example.test", "fixture-only", "operator").query(UUID.class).single();
        String createStation = """
                {"station":{"brand_id":"%s","name":"Fixture","address":"Fixture","lat":0,"lng":0}}
                """.formatted(brand);
        assertEquals(201, request("/api/stations", "POST", createStation, session.accessToken()));
        UUID owned = jdbc.sql("select id from stations where operator_id=? and brand_id=?")
                .params(session.user().id(), brand).query(UUID.class).single();
        UUID other = station(another, brand);
        assertEquals(200, get("/api/stations/" + owned, session.accessToken()));
        assertEquals(404, get("/api/stations/" + other, session.accessToken()));
        assertEquals(404, request("/api/stations/" + other, "DELETE", "", session.accessToken()));
        UUID type = jdbc.sql("insert into connector_types(code,name,current_type) values(?,?,'DC') returning id")
                .params(UUID.randomUUID().toString().substring(0, 12), "Fixture DC").query(UUID.class).single();
        UUID connector = jdbc.sql("insert into connectors(station_id,connector_type_id) values(?,?) returning id")
                .params(other, type).query(UUID.class).single();
        UUID image = jdbc.sql("insert into station_images(station_id,url) values(?,?) returning id")
                .params(other, "https://example.test/image.png").query(UUID.class).single();
        String connectorBody = "{\"connector_type_id\":\"" + type + "\"}";
        assertEquals(404, request("/api/connectors/" + connector, "PUT", connectorBody, session.accessToken()));
        assertEquals(404, request("/api/connectors/" + connector, "DELETE", "", session.accessToken()));
        assertEquals(404, request("/api/stations/" + other + "/images/" + image, "DELETE", "", session.accessToken()));
        String replacement = """
                {"operator_id":"%s","brand_id":"%s","name":"Fixture","address":"Fixture","lat":0,"lng":0}
                """.formatted(another, brand);
        assertEquals(404, request("/api/stations/" + other, "PUT", replacement, session.accessToken()));
        assertEquals(403, request("/api/stations/" + owned, "PUT", replacement, session.accessToken()));
        assertEquals(200, request("/api/stations/" + owned, "PUT",
                """
                {"brand_id":"%s","name":"Renamed","address":"Fixture","lat":0,"lng":0}
                """.formatted(brand), session.accessToken()));
        assertEquals(204, request("/api/stations/" + owned, "DELETE", "", session.accessToken()));
        jdbc.sql("update users set status='banned' where id=?").param(session.user().id()).update();
        assertEquals(401, get("/api/auth/me", session.accessToken()));
        assertBusinessCode("error.invalid-session", () -> auth.refresh(new Refresh(session.refreshToken(), "web")));
    }

    @Test
    void upgradesV6WithoutDroppingExistingCatalogLinksAndBackfillsVehicleName() {
        String schema = "upgrade_" + UUID.randomUUID().toString().replace("-", "");
        jdbc.sql("create schema " + schema).update();
        var isolated = new org.springframework.jdbc.datasource.DriverManagerDataSource(jdbcUrl, jdbcUser, jdbcPassword);
        var connectionProperties = new java.util.Properties();
        connectionProperties.setProperty("currentSchema", schema);
        isolated.setConnectionProperties(connectionProperties);
        try {
            org.flywaydb.core.Flyway.configure().dataSource(isolated).schemas(schema).target("6").load().migrate();
            UUID brand = jdbc.sql("insert into " + schema + ".brands(name) values('Existing') returning id")
                    .query(UUID.class).single();
            UUID model = jdbc.sql("insert into " + schema + ".vehicles_infor(brand_id,model,battery_kwh,range_nedc_km) "
                    + "values(?,'Existing Model',40,200) returning id").param(brand).query(UUID.class).single();
            UUID driver = jdbc.sql("insert into " + schema + ".users(name,email,password_hash,role) "
                    + "values('Driver','driver@example.test','fixture-only','driver') returning id").query(UUID.class).single();
            UUID vehicle = jdbc.sql("insert into " + schema + ".user_vehicles(user_id,vehicle_info_id) values(?,?) returning id")
                    .params(driver, model).query(UUID.class).single();

            assertEquals(3, org.flywaydb.core.Flyway.configure().dataSource(isolated).schemas(schema)
                    .load().migrate().migrationsExecuted);
            assertEquals(1L, jdbc.sql("select count(*) from " + schema + ".brands where id=? and created_by_user_id is null")
                    .param(brand).query(Long.class).single());
            assertEquals(1L, jdbc.sql("select count(*) from " + schema
                    + ".vehicles_infor where id=? and brand_id=? and created_by_user_id is null")
                    .params(model, brand).query(Long.class).single());
            assertEquals(1L, jdbc.sql("select count(*) from " + schema + ".user_vehicles where id=? and user_id=? and vehicle_info_id=?")
                    .params(vehicle, driver, model).query(Long.class).single());
            assertEquals("Existing Model", jdbc.sql("select name from " + schema + ".user_vehicles where id=?")
                    .param(vehicle).query(String.class).single());
            assertEquals("user_vehicles", jdbc.sql("select relname from pg_class "
                    + "where oid=to_regclass('public.user_vehicles')").query(String.class).single());
        } finally {
            jdbc.sql("drop schema if exists " + schema + " cascade").update();
        }
    }

    @Test
    void catalogOwnershipAndDriverVehicleIsolation() throws Exception {
        AuthSessionResponse operator = fixtureSession("operator");
        AuthSessionResponse other = fixtureSession("operator");
        AuthSessionResponse driver = fixtureSession("driver");
        AuthSessionResponse otherDriver = fixtureSession("driver");
        AuthSessionResponse admin = fixtureSession("admin");
        String ownerToken = operator.accessToken();
        String name = "Fixture " + UUID.randomUUID();
        String brandBody = "{\"name\":\"" + name + "\"}";
        assertEquals(201, request("/api/brands", "POST", brandBody, ownerToken));
        UUID brandId = jdbc.sql("select id from brands where name=?").param(name).query(UUID.class).single();
        String brand = "/api/brands/" + brandId;
        assertEquals(403, request(brand, "PUT", brandBody, other.accessToken()));
        assertEquals(403, request(brand, "DELETE", "", other.accessToken()));
        assertEquals(200, request(brand, "PUT", brandBody, ownerToken));
        assertEquals(200, request(brand, "PUT", brandBody, admin.accessToken()));

        String catalog = "/api/vehicles-infor";
        String modelBody = """
                {"brand_id":"%s","model":"Fixture Model","battery_kwh":45,"range_nedc_km":300}
                """.formatted(brandId);
        try (var executor = Executors.newFixedThreadPool(2)) {
            var first = executor.submit(() -> request(catalog, "POST", modelBody, ownerToken));
            var second = executor.submit(() -> request(catalog, "POST", modelBody, ownerToken));
            assertEquals(java.util.Set.of(201, 409), java.util.Set.of(first.get(), second.get()));
        }
        assertEquals(409, request(catalog, "POST", modelBody, other.accessToken()));
        assertEquals(403, request(catalog, "POST", modelBody, driver.accessToken()));
        UUID modelId = jdbc.sql("select id from vehicles_infor where brand_id=?")
                .param(brandId).query(UUID.class).single();
        String model = catalog + "/" + modelId;
        assertEquals(200, get(model, other.accessToken()));
        assertEquals(403, request(model, "PUT", modelBody, other.accessToken()));
        assertEquals(200, request(model, "PUT", modelBody, admin.accessToken()));
        assertEquals(409, request(brand, "DELETE", "", ownerToken));

        String garage = "/api/user-vehicles";
        String vehicleBody = "{\"vehicle_info_id\":\"" + modelId + "\"}";
        assertEquals(403, get(garage, ownerToken));
        assertEquals(201, request(garage, "POST", vehicleBody, driver.accessToken()));
        UUID vehicleId = jdbc.sql("select id from user_vehicles where user_id=?")
                .param(driver.user().id()).query(UUID.class).single();
        String vehicle = garage + "/" + vehicleId;
        assertEquals("Fixture Model", vehicleName(vehicleId));
        assertEquals(200, get(vehicle, driver.accessToken()));
        String customName = "Xe thu nhat";
        String rename = """
                {"vehicle_info_id":"%s","name":"  %s  "}
                """.formatted(modelId, customName);
        assertEquals(200, request(vehicle, "PUT", rename, driver.accessToken()));
        assertEquals(customName, vehicleName(vehicleId));
        assertEquals(200, request(vehicle, "PUT", vehicleBody, driver.accessToken()));
        assertEquals(customName, vehicleName(vehicleId));
        String resetName = """
                {"vehicle_info_id":"%s","name":"  "}
                """.formatted(modelId);
        assertEquals(200, request(vehicle, "PUT", resetName, driver.accessToken()));
        assertEquals("Fixture Model", vehicleName(vehicleId));
        assertEquals(404, get(vehicle, otherDriver.accessToken()));
        assertEquals(404, request(vehicle, "PUT", vehicleBody, otherDriver.accessToken()));
        assertEquals(404, request(vehicle, "DELETE", "", otherDriver.accessToken()));
        assertEquals(409, request(model, "DELETE", "", ownerToken));
        assertEquals(204, request(vehicle, "DELETE", "", driver.accessToken()));
        assertEquals(204, request(model, "DELETE", "", ownerToken));
    }

    @Test
    void blogWorkflowEnforcesOwnershipAndPublishedVisibility() throws Exception {
        String admin = fixtureSession("admin").accessToken();
        AuthSessionResponse author = fixtureSession("operator");
        AuthSessionResponse other = fixtureSession("operator");
        String operator = author.accessToken();
        String driver = fixtureSession("driver").accessToken();
        String management = "/api/blog-posts";
        String published = "/api/public/blog-posts";
        String content = """
                {"title":"Blog Fixture","content":"Post body","status":"%s"}
                """;
        assertEquals(200, get(published, null));
        assertEquals(401, get(management, null));
        assertEquals(403, get(management, driver));
        assertEquals(403, request(management, "POST", content.formatted("PUBLISHED"), operator));
        assertEquals(201, request(management, "POST", content.formatted("DRAFT"), operator));
        String post = management + "/" + jdbc.sql("select id from blog_posts where author_id=?")
                .param(author.user().id()).query(UUID.class).single();
        String publicPost = published + "/blog-fixture";
        assertEquals(404, get(publicPost, null));
        assertEquals(403, get(post, other.accessToken()));
        assertEquals(403, request(post, "DELETE", "", other.accessToken()));
        assertEquals(400, request(post + "/approve", "POST", "", admin));
        assertEquals(200, request(post + "/submit", "POST", "", operator));
        assertEquals(403, request(post, "PUT", content.formatted("PENDING_REVIEW"), operator));
        assertEquals(403, request(post + "/approve", "POST", "", operator));
        assertEquals(400, request(post + "/reject", "POST", "{\"rejectionReason\":\"  \"}", admin));
        assertEquals(200, request(post + "/reject", "POST", "{\"rejectionReason\":\"Revise\"}", admin));
        assertEquals(200, request(post + "/submit", "POST", "", operator));
        assertEquals(200, request(post + "/approve", "POST", "", admin));
        assertEquals(400, request(post + "/approve", "POST", "", admin));
        assertEquals(200, get(publicPost, null));
        assertEquals(200, request(post, "PUT", content.formatted("ARCHIVED"), admin));
        assertEquals(404, get(publicPost, null));
        assertEquals(204, request(post, "DELETE", "", admin));
        assertEquals(404, get(post, admin));

        assertEquals(201, request(management, "POST", content.formatted("PUBLISHED"), admin));
        assertEquals(200, get(published + "/blog-fixture-2", null));
    }

    private String vehicleName(UUID id) {
        return jdbc.sql("select name from user_vehicles where id=?").param(id).query(String.class).single();
    }

    private AuthSessionResponse fixtureSession(String role) {
        String password = "fixture-test-password";
        String email = role.equals("admin") ? "fixture-admin@example.test" : UUID.randomUUID() + "@example.test";
        if (role.equals("admin") && jdbc.sql("select count(*) from users where email=?").param(email).query(Long.class).single() > 0) {
            return auth.login(new Login(email, password, "web"));
        }
        String hash = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode(password);
        jdbc.sql("insert into users(name,email,password_hash,role,email_verified) values(?,?,?,?,true)")
                .params("Fixture " + role, email, hash, role).update();
        return auth.login(new Login(email, password, role.equals("driver") ? "mobile" : "web"));
    }

    @Test
    void expiredAndLockedOtpRequiresNewCode() {
        String email = UUID.randomUUID() + "@example.test";
        String password = "test-fixture-password";
        auth.register(new Registration("Expiry Fixture", email, password));
        String first = capturedCode();
        jdbc.sql("""
                update otp_verifications set expires_at=now()-interval '1 minute',created_at=now()-interval '2 minutes'
                where user_id=(select id from users where email=?)
                """).param(email).update();
        assertBusinessCode("error.invalid-otp", () -> auth.verify(new Verification(email, first)));

        clearInvocations(mail);
        auth.resend(email);
        String next = capturedCode();
        String wrong = next.equals("123456") ? "654321" : "123456";
        for (int index = 0; index < 5; index++) {
            assertBusinessCode("error.invalid-otp", () -> auth.verify(new Verification(email, wrong)));
        }
        assertBusinessCode("error.too-many-attempts", () -> auth.verify(new Verification(email, next)));
        auth.resend(email);
        verifyNoMoreInteractions(mail);
    }

    @Test
    void roleChangeAndTamperedJwtCannotUseExistingSession() throws Exception {
        String email = UUID.randomUUID() + "@example.test";
        String password = "test-fixture-password";
        auth.register(new Registration("Role Fixture", email, password));
        auth.verify(new Verification(email, capturedCode()));
        AuthSessionResponse session = auth.login(new Login(email, password, "mobile"));
        String token = session.accessToken();
        int signature = token.lastIndexOf('.') + 1;
        char replacement = token.charAt(signature) == 'A' ? 'B' : 'A';
        String tampered = token.substring(0, signature) + replacement + token.substring(signature + 1);
        assertEquals(401, get("/api/auth/me", tampered));
        jdbc.sql("update users set role='operator' where id=?").param(session.user().id()).update();
        assertEquals(401, get("/api/auth/me", token));
        assertBusinessCode("error.invalid-session", () -> auth.refresh(new Refresh(session.refreshToken(), "mobile")));
    }

    @Test
    void mailFailureDoesNotCommitPartialRegistration() {
        String email = UUID.randomUUID() + "@example.test";
        doThrow(new MailSendException("Simulated transport error")).when(mail).send(any(SimpleMailMessage.class));
        assertThrows(AuthDeliveryException.class,
                () -> auth.register(new Registration("Transport Fixture", email, "test-fixture-password")));
        assertFalse(jdbc.sql("select exists(select 1 from users where email=?)").param(email).query(Boolean.class).single());
    }

    @Test
    void sameOtpAndRefreshAreSerialized() throws Exception {
        String email = UUID.randomUUID() + "@example.test";
        String password = "test-fixture-password";
        auth.register(new Registration("Concurrent Driver", email, password));
        Verification verification = new Verification(email, capturedCode());
        try (var pool = Executors.newFixedThreadPool(2)) {
            var first = pool.submit(() -> attempt(() -> auth.verify(verification)));
            var second = pool.submit(() -> attempt(() -> auth.verify(verification)));
            assertNotEquals(first.get(), second.get());
            AuthSessionResponse session = auth.login(new Login(email, password, "mobile"));
            Refresh refresh = new Refresh(session.refreshToken(), "mobile");
            var refreshOne = pool.submit(() -> attempt(() -> auth.refresh(refresh)));
            var refreshTwo = pool.submit(() -> attempt(() -> auth.refresh(refresh)));
            assertNotEquals(refreshOne.get(), refreshTwo.get());
            assertEquals(401, get("/api/auth/me", session.accessToken()));
        }
    }

    private static boolean attempt(Runnable action) {
        try {
            action.run();
            return true;
        } catch (CustomBusinessException rejected) {
            return false;
        }
    }

    private UUID station(UUID operator, UUID brand) {
        return jdbc.sql("insert into stations(operator_id,brand_id,name,address,lat,lng) values(?,?, 'Fixture','Fixture',0,0) returning id")
                .params(operator, brand).query(UUID.class).single();
    }

    private String capturedCode() {
        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mail).send(captor.capture());
        var matcher = Pattern.compile("\\b[0-9]{6}\\b").matcher(captor.getValue().getText());
        if (!matcher.find()) fail("Mock email did not contain an OTP");
        return matcher.group();
    }

    private int get(String path, String token) throws Exception {
        return request(path, "GET", "", token);
    }

    private int request(String path, String method, String body, String token) throws Exception {
        var builder = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + path));
        if (token != null) builder.header("Authorization", "Bearer " + token);
        var request = builder.header("Content-Type", "application/json")
                .method(method, body.isEmpty() ? HttpRequest.BodyPublishers.noBody() : HttpRequest.BodyPublishers.ofString(body))
                .build();
        try (var client = HttpClient.newHttpClient()) {
            return client.send(request, HttpResponse.BodyHandlers.discarding()).statusCode();
        }
    }

    private static void assertBusinessCode(String code, org.junit.jupiter.api.function.Executable action) {
        assertEquals(code, assertThrows(CustomBusinessException.class, action).getCode());
    }
}
