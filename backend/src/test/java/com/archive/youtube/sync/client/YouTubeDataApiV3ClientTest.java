package com.archive.youtube.sync.client;

import com.archive.youtube.sync.client.model.YouTubePlaylistItemsPage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.lang.reflect.Field;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class YouTubeDataApiV3ClientTest {

    private MockRestServiceServer mockServer;
    private YouTubeDataApiV3Client client;

    @BeforeEach
    void setUp() throws Exception {
        RestClient.Builder restClientBuilder = RestClient.builder().baseUrl("https://www.googleapis.com/youtube/v3");
        mockServer = MockRestServiceServer.bindTo(restClientBuilder).build();
        RestClient restClient = restClientBuilder.build();

        client = new YouTubeDataApiV3Client("https://www.googleapis.com/youtube/v3", "AIzaTestFakeKey");

        Field field = YouTubeDataApiV3Client.class.getDeclaredField("restClient");
        field.setAccessible(true);
        field.set(client, restClient);
    }

    @Test
    @DisplayName("채널 핸들로 uploads 재생목록 ID를 성공적으로 파싱한다")
    void getUploadsPlaylistId_parsesCorrectly() {
        String json = """
            {
              "items": [
                {
                  "id": "UC12345",
                  "contentDetails": {
                    "relatedPlaylists": {
                      "uploads": "UU12345_UPLOADS"
                    }
                  }
                }
              ]
            }
            """;

        mockServer.expect(requestTo("https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet&forHandle=Mondo2233&key=AIzaTestFakeKey"))
            .andExpect(method(HttpMethod.GET))
            .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));

        String uploadsId = client.getUploadsPlaylistId("@Mondo2233");

        assertThat(uploadsId).isEqualTo("UU12345_UPLOADS");
        mockServer.verify();
    }

    @Test
    @DisplayName("재생목록 항목 목록을 파싱하고 비공개 영상을 필터링한다")
    void fetchPlaylistItems_parsesAndFilters() {
        String json = """
            {
              "nextPageToken": "NEXT_PAGE_TOKEN_ABC",
              "pageInfo": {
                "totalResults": 1,
                "resultsPerPage": 50
              },
              "items": [
                {
                  "contentDetails": {
                    "videoId": "test_video_1"
                  },
                  "snippet": {
                    "title": "[Mondo] 테스트 라이브 방송",
                    "description": "설명 텍스트",
                    "publishedAt": "2026-10-31T15:00:00Z",
                    "thumbnails": {
                      "high": {
                        "url": "https://i.ytimg.com/vi/test_video_1/hqdefault.jpg"
                      }
                    }
                  }
                }
              ]
            }
            """;

        mockServer.expect(requestTo("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=UU12345&maxResults=50&key=AIzaTestFakeKey"))
            .andExpect(method(HttpMethod.GET))
            .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));

        YouTubePlaylistItemsPage page = client.fetchPlaylistItems("UU12345", null, 50);

        assertThat(page.nextPageToken()).isEqualTo("NEXT_PAGE_TOKEN_ABC");
        assertThat(page.items()).hasSize(1);
        assertThat(page.items().get(0).videoId()).isEqualTo("test_video_1");
        assertThat(page.items().get(0).title()).isEqualTo("[Mondo] 테스트 라이브 방송");
        assertThat(page.items().get(0).thumbnailUrl()).isEqualTo("https://i.ytimg.com/vi/test_video_1/hqdefault.jpg");

        mockServer.verify();
    }
}
