using System.Diagnostics;
using System.Text;
using MySql.Data.MySqlClient;

class Program
{
    static void Main()
    {
        string connectionString = @"server=localhost;userid=root;password=insy;database=DB_Search_Speed";
        int searchCount = 100;
        Console.Write("Länge des Anfangs: ");
        int length = int.Parse(Console.ReadLine() ?? "1");
        Random rnd = new Random();

        using (MySqlConnection conn = new MySqlConnection(connectionString))
        {
            conn.Open();
            Console.WriteLine("Starte LIKE-Suche...");
            Stopwatch sw = Stopwatch.StartNew();

            using (MySqlCommand cmd = new MySqlCommand("SELECT COUNT(*) FROM Words WHERE value LIKE @val", conn))
            {
                var param = cmd.Parameters.Add("@val", MySqlDbType.VarChar);

                for (int i = 0; i < searchCount; i++)
                {
                    string prefix = GenerateRandomWord(length, rnd);
                    param.Value = prefix + "%";

                    long count = (long)cmd.ExecuteScalar();

                    Console.WriteLine(
                        $"Suche {i + 1}/{searchCount}: Wörter die mit '{prefix}%' beginnen -> {count} Treffer"
                    );
                }
            }

            sw.Stop();
            Console.WriteLine($"Suche abgeschlossen. Dauer: {sw.Elapsed.TotalMilliseconds:N0} ms");
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