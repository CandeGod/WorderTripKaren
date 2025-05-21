package com.wonder_trip.config;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.SneakyThrows;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;

@Component
public class AzureSentimentService {

    private static final String SUBSCRIPTION_KEY = "1L4uboubYUN4Lc97EnaAZfVMhXLtFN1vOfyYURbIee8ONTXDq7GjJQQJ99BEACYeBjFXJ3w3AAAaACOG2ScM";
    private static final String ENDPOINT = "https://wonder.cognitiveservices.azure.com/language/:analyze-text?api-version=2023-04-01";

    private final HttpClient client = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @SneakyThrows
    public String analizarSentimiento(String texto) {
        // Crear documento
        Map<String, Object> document = new HashMap<>();
        document.put("id", "1");
        document.put("language", "es");
        document.put("text", texto);

        Map<String, Object> analysisInput = new HashMap<>();
        analysisInput.put("documents", new Map[]{document});

        Map<String, Object> parameters = new HashMap<>();
        parameters.put("modelVersion", "latest");

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("kind", "SentimentAnalysis");
        requestBody.put("parameters", parameters);
        requestBody.put("analysisInput", analysisInput);

        String requestBodyJson = objectMapper.writeValueAsString(requestBody);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(ENDPOINT))
                .header("Ocp-Apim-Subscription-Key", SUBSCRIPTION_KEY)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBodyJson))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        JsonNode responseJson = objectMapper.readTree(response.body());
        String sentiment = responseJson.at("/results/documents/0/sentiment").asText();

        return switch (sentiment) {
            case "positive" -> "positivo";
            case "negative" -> "negativo";
            case "neutral" -> "neutral";
            case "mixed" -> "mezclado";
            default -> "desconocido";
        };
    }
}