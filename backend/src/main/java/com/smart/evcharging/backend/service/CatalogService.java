package com.smart.evcharging.backend.service;

import com.smart.evcharging.backend.dto.request.BrandRequest;
import com.smart.evcharging.backend.dto.request.ConnectorTypeRequest;
import com.smart.evcharging.backend.dto.request.OperatorRequest;
import com.smart.evcharging.backend.dto.request.UpdateOperatorRequest;
import com.smart.evcharging.backend.dto.response.AllowedBrandResponse;
import com.smart.evcharging.backend.dto.response.BrandResponse;
import com.smart.evcharging.backend.dto.response.ConnectorTypeResponse;
import com.smart.evcharging.backend.dto.response.OperatorResponse;
import java.util.List;
import java.util.UUID;

public interface CatalogService {
    List<BrandResponse> brands();
    List<ConnectorTypeResponse> connectorTypes();
    List<OperatorResponse> operators();
    BrandResponse createBrand(BrandRequest request);
    ConnectorTypeResponse createConnectorType(ConnectorTypeRequest request);
    OperatorResponse createOperator(OperatorRequest request);
    void deleteBrand(UUID id);
    BrandResponse updateBrand(UUID id, BrandRequest request);
    ConnectorTypeResponse updateConnectorType(UUID id, ConnectorTypeRequest request);
    OperatorResponse updateOperator(UUID id, UpdateOperatorRequest request);
    List<AllowedBrandResponse> allowedBrands(UUID operatorId);
    List<AllowedBrandResponse> replaceAllowedBrands(UUID operatorId, List<UUID> brandIds);
}
