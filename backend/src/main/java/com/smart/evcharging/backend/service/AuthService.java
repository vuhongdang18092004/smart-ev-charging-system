package com.smart.evcharging.backend.service;

import com.smart.evcharging.backend.dto.request.AuthRequests.*;
import com.smart.evcharging.backend.dto.response.AuthSessionResponse;
import com.smart.evcharging.backend.dto.response.AuthUserResponse;

public interface AuthService {
    void register(Registration request);
    void verify(Verification request);
    void resend(String email);
    void forgot(String email);
    void reset(Reset request);
    void invite(Invitation request);
    AuthSessionResponse login(Login request);
    AuthSessionResponse refresh(Refresh request);
    void logout(Refresh request);
    AuthUserResponse me(String email);
}
