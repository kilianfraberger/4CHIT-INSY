using System;
using System.Diagnostics;
using System.Text;
using MySql.Data.MySqlClient;

class Program
{
    static void Main()
    {
        string connectionString = @"server=localhost;userid=root;password=insy;database=DB_Search_Speed";
        int searchCount = 100;
        Random rnd = new Random();

        using (MySqlConnection conn = new MySqlConnection(connectionString))
        {
            conn.Open();
            Console.WriteLine("Starte Suche...");
            Stopwatch sw = Stopwatch.StartNew();
            int foundCount = 0;

            using (MySqlCommand cmd = new MySqlCommand("SELECT value FROM Words WHERE value = @val", conn))
            {
                var param = cmd.Parameters.Add("@val", MySqlDbType.VarChar);

                for (int i = 0; i < searchCount; i++)
                {
                    string word = GenerateRandomWord(10, rnd);
                    param.Value = word;

                    int treffer = 0;
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            // Zugriff auf den gefundenen Wert möglich:
                            // string val = reader.GetString(0);
                            treffer++;
                        }
                    }

                    if (treffer > 0) foundCount++;

                    Console.WriteLine(
                        $"Suche {i + 1}/{searchCount}: {word} {(treffer > 0 ? "gefunden" : "nicht gefunden")}"
                    );
                }
            }

            sw.Stop();
            Console.WriteLine($"Suche abgeschlossen. {foundCount} von {searchCount} Wörtern gefunden.");
            Console.WriteLine($"Benötigte Zeit: {sw.Elapsed.TotalMilliseconds:N0} ms");
        }
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
