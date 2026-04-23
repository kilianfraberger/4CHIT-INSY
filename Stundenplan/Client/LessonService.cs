using System.Net.Http.Json;
using Model;

public class LessonService
{
    private readonly HttpClient _http;
    public LessonService(HttpClient http) => _http = http;
    
    public async Task<List<Lesson>> GetLessonsAsync() {
        return await _http.GetFromJsonAsync<List<Lesson>>("api/lesson");
    }

    public async Task SaveAsync(Lesson lesson)
    {
        if (lesson.Id == 0) await _http.PostAsJsonAsync("api/Lesson", lesson);
        else await _http.PutAsJsonAsync($"api/Lesson/{lesson.Id}", lesson);
    }

    public async Task DeleteAsync(int id) => await _http.DeleteAsync($"api/Lesson/{id}");
}