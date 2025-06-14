export function submitExpense(event) {
  event.preventDefault();
  const form = event.target;
  const button = form.querySelector("button[type='submit']");
  button.disabled = true;

  const expense = {
    type: form.type.value.trim(),
    amount: parseInt(form.amount.value),
    date: form.date.value,
    note: form.note.value.trim()
  };

  if (!expense.type || isNaN(expense.amount) || !expense.date) {
    alert("Barcha majburiy maydonlar to‘ldirilishi kerak!");
    button.disabled = false;
    return;
  }

  fetch("http://localhost:3000/expenses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(expense)
  })
    .then(res => {
      if (!res.ok) throw new Error("Xarajat qo‘shishda xatolik");
      return res.text();
    })
    .then(msg => {
      alert(msg);
      form.reset();
      loadExpenses(); // ✅ TO‘G‘RI chaqiruv shu
    })
    .catch(err => alert(err.message))
    .finally(() => {
      button.disabled = false;
    });
}



export function loadExpenses() {
  fetch("http://localhost:3000/expenses")
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById("expenses-body");
      tbody.innerHTML = "";

      data.forEach(expense => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${expense.date}</td>
          <td>${expense.type}</td>
          <td>${expense.amount} so'm</td>
          <td>${expense.note || "-"}</td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch(() => alert("Xarajatlar ro‘yxatini olishda xatolik yuz berdi"));
}