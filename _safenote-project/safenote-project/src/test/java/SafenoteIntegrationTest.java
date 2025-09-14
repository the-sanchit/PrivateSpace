import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;

import java.util.Base64;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class SafenoteIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    private String getRootUrl() {
        return "http://localhost:" + port;
    }

    @Test
    public void contextLoads() {
        // Test that Spring context loads successfully
        Assertions.assertNotNull(restTemplate);
    }

    @Test
    public void shouldRequireAuthenticationForGetNotes() {
        ResponseEntity<String> response = restTemplate.getForEntity(
                getRootUrl() + "/notes", String.class);

        Assertions.assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    public void shouldRequireAuthenticationForPostNotes() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String noteJson = "{\"content\":\"Test note\"}";
        HttpEntity<String> entity = new HttpEntity<>(noteJson, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(
                getRootUrl() + "/notes", entity, String.class);

        Assertions.assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    public void shouldGetNotesForAuthenticatedUser() {
        HttpHeaders headers = createAuthHeaders("testuser", "password123");
        HttpEntity<String> entity = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(
                getRootUrl() + "/notes", HttpMethod.GET, entity, String.class);

        Assertions.assertEquals(HttpStatus.OK, response.getStatusCode());
        Assertions.assertNotNull(response.getBody());
    }

    @Test
    public void shouldCreateNoteForAuthenticatedUser() {
        HttpHeaders headers = createAuthHeaders("testuser", "password123");
        headers.setContentType(MediaType.APPLICATION_JSON);

        String noteJson = "{\"content\":\"My integration test note\"}";
        HttpEntity<String> entity = new HttpEntity<>(noteJson, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(
                getRootUrl() + "/notes", entity, String.class);

        Assertions.assertEquals(HttpStatus.OK, response.getStatusCode());
        Assertions.assertTrue(response.getBody().contains("integration test note"));
    }

    private HttpHeaders createAuthHeaders(String username, String password) {
        HttpHeaders headers = new HttpHeaders();
        String credentials = username + ":" + password;
        String encodedCredentials = Base64.getEncoder().encodeToString(credentials.getBytes());
        headers.set("Authorization", "Basic " + encodedCredentials);
        return headers;
    }
}
