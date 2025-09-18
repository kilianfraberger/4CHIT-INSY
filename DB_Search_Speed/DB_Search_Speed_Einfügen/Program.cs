using System;
using System.Text;
using MySql.Data.MySqlClient;
using System.Collections.Generic;

class Program
{
    static void Main(string[] args)
    {
        string connectionString = @"server=localhost;userid=root;password=insy;database=DB_Search_Speed";
        int wordCount = 1_000_000;
        int batchSize = 10_000;
        Random rnd = new Random();

        using (MySqlConnection conn = new MySqlConnection(connectionString))
        {
            conn.Open();

            Console.WriteLine("Leere Tabelle...");
            using (var cmd = new MySqlCommand("TRUNCATE TABLE Words;", conn))
            {
                cmd.ExecuteNonQuery();
            }

            Console.WriteLine("Starte Einfügen...");

            using (var tran = conn.BeginTransaction())
            {
                int inserted = 0;

                while (inserted < wordCount)
                {
                    int currentBatch = Math.Min(batchSize, wordCount - inserted);
                    var values = new List<string>(currentBatch);

                    for (int i = 0; i < currentBatch; i++)
                    {
                        string word = GenerateRandomWord(10, rnd);
                        int number = rnd.Next(1, 21);
                        values.Add($"('{word}', {number})");
                    }

                    string sql = $"INSERT INTO Words (value, number) VALUES {string.Join(",", values)};";
                    using (var cmd = new MySqlCommand(sql, conn, tran))
                    {
                        cmd.ExecuteNonQuery();
                    }

                    inserted += currentBatch;
                    Console.WriteLine($"{inserted:N0} Wörter eingefügt...");
                }

                tran.Commit();
            }
        }

        Console.WriteLine($"Fertig! {wordCount:N0} Wörter wurden eingefügt.");
    }

    static string GenerateRandomWord(int length, Random rnd)
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++)
        {
            sb.Append(chars[rnd.Next(chars.Length)]);
        }
        return sb.ToString();
    }
}
