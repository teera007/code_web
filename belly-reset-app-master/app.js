let app, db, storage;

window.addEventListener("DOMContentLoaded", () => {
  try {
    app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    storage = firebase.storage(); // ✅ เพิ่มให้แน่ชัด

    if (document.getElementById("user-list")) loadUsers();
    if (document.getElementById("food-list")) loadFoodCatalog();
  } catch (err) {
    alert("❌ ยังไม่ได้เชื่อม Firebase หรือ firebaseConfig.js หาย");
  }
});

// --------------------- จัดการผู้ใช้ ---------------------
const form = document.getElementById("user-form");
const userList = document.getElementById("user-list");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = form.name.value;
  const gender = form.gender.value;
  const age = parseInt(form.age.value);
  const height = parseFloat(form.height.value);
  const weight = parseFloat(form.weight.value);

  try {
    await db.collection("users").add({ name, gender, age, height, weight });
    form.reset();
    loadUsers();
  } catch (err) {
    alert("❌ เพิ่มข้อมูลไม่สำเร็จ: " + err.message);
  }
});

async function loadUsers() {
  userList.innerHTML = "<li>กำลังโหลด...</li>";
  try {
    const snapshot = await db.collection("users").get();
    userList.innerHTML = "";
    snapshot.forEach((doc) => {
      const data = doc.data();
      const li = document.createElement("li");
      li.innerHTML = `
        <a href="edit_user.html?id=${doc.id}" style="color:blue; text-decoration:underline; font-weight:bold;">
          ${data.name}
        </a> | เพศ: ${data.gender || "-"} | อายุ ${data.age || "-"} ปี |
        ส่วนสูง ${data.height || "-"} ซม. | น้ำหนัก ${data.weight || "-"} กก.
        <button onclick="deleteUser('${doc.id}')">🗑️ ลบ</button>
      `;
      userList.appendChild(li);
    });
  } catch (err) {
    userList.innerHTML = "<li>❌ โหลดข้อมูลไม่สำเร็จ</li>";
  }
}

window.deleteUser = async (id) => {
  if (confirm("ลบผู้ใช้นี้หรือไม่?")) {
    await db.collection("users").doc(id).delete();
    loadUsers();
  }
};

// --------------------- จัดการ Food Catalog ---------------------
const foodForm = document.getElementById("food-form");
const foodList = document.getElementById("food-list");

foodForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const foodName = document.getElementById("foodName").value;
  const foodCalories = parseInt(document.getElementById("foodCalories").value);
  const foodImage = document.getElementById("foodImage").files[0];

  if (!foodImage) return alert("กรุณาเลือกรูปภาพอาหาร");

  try {
    const storageRef = storage.ref(`food_images/${Date.now()}_${foodImage.name}`); // ✅ ใช้ storage ที่ถูกต้อง
    await storageRef.put(foodImage);
    const imageUrl = await storageRef.getDownloadURL();

    await db.collection("food_catalog").add({
      name: foodName,
      calories: foodCalories,
      imageUrl: imageUrl,
      createdAt: firebase.firestore.Timestamp.now()
    });

    alert("✅ เพิ่มอาหารสำเร็จ");
    foodForm.reset();
    loadFoodCatalog();
  } catch (err) {
    console.error("❌ อัปโหลดอาหารไม่สำเร็จ:", err);
    alert("❌ อัปโหลดอาหารไม่สำเร็จ: " + err.message);
  }
});

async function loadFoodCatalog() {
  if (!foodList) return;
  foodList.innerHTML = "<li>🍴 กำลังโหลด...</li>";

  try {
    const snapshot = await db.collection("food_catalog").orderBy("createdAt", "desc").limit(10).get();
    foodList.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const li = document.createElement("li");
      li.innerHTML = `
        <img src="${data.imageUrl}" alt="อาหาร">
        <div class="food-info">
          <div class="food-name">${data.name}</div>
          <div class="food-calories">${data.calories} kcal</div>
        </div>
      `;
      foodList.appendChild(li);
    });
  } catch (err) {
    foodList.innerHTML = "<li>❌ โหลดอาหารไม่สำเร็จ</li>";
  }
}
