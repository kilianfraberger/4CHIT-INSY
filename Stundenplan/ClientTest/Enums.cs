using System.ComponentModel;
using System.Reflection;

namespace ClientTest;

public static class Enums
{
    public static string GetDescription(this Enum value)
    {
        var field = value.GetType().GetField(value.ToString());
        var attribute = field?.GetCustomAttribute<DescriptionAttribute>();
        return attribute?.Description??value.ToString();
    }
}