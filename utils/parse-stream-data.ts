
export const parseStreamData = (lines: string[]) => {
    for (const line of lines) {
      const message = line.replace(/^data: /, "");
      if (message === "[DONE]") {
        return; // Stream finished
      }
      try {
        const parsed = JSON.parse(message);
        return parsed.choices[0].text;
      } catch (error) {
        console.error("Could not JSON parse stream message", message, error);
      }
    }
}