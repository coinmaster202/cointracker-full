async function deleteHistory() {
  if (!confirm("Are you sure you want to delete all history and send it to your email?")) return;

  const hostName = localStorage.getItem("hostName") || "Unknown";
  const data = [];
  document.querySelectorAll(".week").forEach((week, wIndex) => {
    const rows = week.querySelectorAll("tbody[data-type='calls'] tr");
    rows.forEach(row => {
      data.push({
        week: wIndex + 1,
        day: row.cells[0].textContent,
        name: row.cells[1].querySelector("input").value,
        id: row.cells[2].querySelector("input").value,
        minutes: row.cells[3].querySelector("input").value,
        coins: row.cells[4].textContent,
        dollars: row.cells[5].textContent
      });
    });
  });

  const ip = await fetch("https://api.ipify.org?format=json")
    .then(res => res.json())
    .then(json => json.ip)
    .catch(() => "unknown");

  try {
    const res = await fetch("/api/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hostName,
        data,
        ip,
        deviceInfo: navigator.userAgent
      })
    });

    let result;
    try {
      result = await res.json();
    } catch {
      const text = await res.text();
      throw new Error(text);
    }

    if (res.ok) {
      localStorage.clear();
      alert("History deleted.");
      location.reload();
    } else {
      alert("Server error: " + result.message);
    }
  } catch (err) {
    alert("Failed to delete: " + err.message);
  }
}