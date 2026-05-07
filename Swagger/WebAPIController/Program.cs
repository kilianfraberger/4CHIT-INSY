using Model;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
var allow = "allow_my_api";
// 2. Den DbContext registrieren
builder.Services.AddDbContext<SwaggerContext>();
builder.Services.AddCors(
    options => 
        options.AddPolicy(name: allow,
            policy =>
            {
                policy.AllowAnyOrigin()
                    .AllowAnyHeader()
                    .AllowAnyMethod();

                //.WithOrigins("http://localhost:5253", "http://localhost:5253");
            }
            ));
builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors(allow);
app.UseAuthorization();

app.MapControllers();

app.Run();