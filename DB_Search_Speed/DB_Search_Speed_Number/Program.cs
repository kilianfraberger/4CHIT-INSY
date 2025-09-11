using System;
using System.Diagnostics;
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
            Console.WriteLine("Starte Zahlensuche...");
            Stopwatch sw = Stopwatch.StartNew();
            int foundCount = 0;
            
            using (MySqlCommand cmd = new MySqlCommand("SELECT COUNT(*) FROM Words WHERE number = @num", conn))
            {
                var param = cmd.Parameters.Add("@num", MySqlDbType.Int32);

                for (int i = 0; i < searchCount; i++)
                {
                    int number = rnd.Next(1, 6);
                    param.Value = number;

                    long count = (long)cmd.ExecuteScalar();
                    if (count > 0) foundCount++;

                    Console.WriteLine($"Suche {i + 1}/{searchCount}: Zahl {number} -> {(count > 0 ? $"{count} Treffer" : "keine Treffer")}");
                }
            }

            sw.Stop();
            Console.WriteLine($"Suche abgeschlossen. {foundCount} von {searchCount} Zahlen haben Treffer geliefert.");
            Console.WriteLine($"Benötigte Zeit: {sw.Elapsed.TotalMilliseconds:N0} ms");
        }
    }
}