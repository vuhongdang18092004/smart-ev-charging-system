package com.smart.evcharging.backend.service;

import com.smart.evcharging.backend.dto.request.BrandRequest;
import com.smart.evcharging.backend.dto.request.ConnectorTypeRequest;
import com.smart.evcharging.backend.dto.request.OperatorRequest;
import com.smart.evcharging.backend.dto.response.BrandResponse;
import com.smart.evcharging.backend.dto.response.ConnectorTypeResponse;
import com.smart.evcharging.backend.dto.response.OperatorResponse;
import java.util.List;

public interface CatalogService {
    List<BrandResponse> brands();
    List<ConnectorTypeResponse> connectorTypes();
    List<OperatorResponse> operators();
    BrandResponse createBrand(BrandRequest request);
    ConnectorTypeResponse createConnectorType(ConnectorTypeRequest request);
    OperatorResponse createOperator(OperatorRequest request);
}
