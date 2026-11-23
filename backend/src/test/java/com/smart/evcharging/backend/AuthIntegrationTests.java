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
        UUID owned = station(session.user().id(), brand);
        UUID other = station(another, brand);
        assertEquals(200, get("/api/stations/" + owned, session.accessToken()));
        assertEquals(404, get("/api/stations/" + other, session.accessToken()));
        assertEquals(404, request("/api/stations/" + other, "DELETE", "", session.accessToken()));
        String replacement = """
                {"operator_id":"%s","brand_id":"%s","name":"Fixture","address":"Fixture","lat":0,"lng":0}
                """.formatted(another, brand);
        assertEquals(404, request("/api/stations/" + other, "PUT", replacement, session.accessToken()));
        assertEquals(403, request("/api/stations/" + owned, "PUT", replacement, session.accessToken()));
        jdbc.sql("update users set status='banned' where id=?").param(session.user().id()).update();
        assertEquals(401, get("/api/auth/me", session.accessToken()));
        assertBusinessCode("error.invalid-session", () -> auth.refresh(new Refresh(session.refreshToken(), "web")));
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
        var request = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + path))
                .header("Authorization", "Bearer " + token).header("Content-Type", "application/json")
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
