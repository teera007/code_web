/**
 * 🔐 AUTH GUARD SYSTEM
 * ระบบตรวจสอบสิทธิ์การเข้าถึงหน้าต่างๆ
 * Version: 1.1.0 - เพิ่ม Exercise Manager
 */

// ⚙️ กำหนดสิทธิ์การเข้าถึงแต่ละหน้า
const AUTH_CONFIG = {
  // หน้าจัดการบทความ - เฉพาะ Super Admin และ Content Manager
  articles: ['super_admin', 'content_manager'],
  
  // หน้าจัดการผู้ใช้ - เฉพาะ Super Admin และ User Manager
  manage_users: ['super_admin', 'user_manager'],
  
  // หน้าจัดการคลังอาหาร - เฉพาะ Super Admin และ Food Manager
  food_catalog: ['super_admin', 'food_manager'],
  
  // หน้าจัดการท่าออกกำลังกาย - เฉพาะ Super Admin และ Exercise Manager
  exercise_guide: ['super_admin', 'exercise_manager'],
  exercise_management: ['super_admin', 'exercise_manager'], // alias
  
  // หน้าจัดการสิทธิ์ผู้ใช้ - เฉพาะ Super Admin และ User Manager
  admin_management: ['super_admin', 'user_manager'],
  
  // หน้า Dashboard - ทุก role ที่เป็น admin
  dashboard: ['super_admin', 'content_manager', 'user_manager', 'food_manager', 'exercise_manager']
};

/**
 * 🔍 ตรวจสอบสิทธิ์การเข้าถึงหน้า
 * @param {string} pageName - ชื่อหน้าที่ต้องการเข้าถึง
 * @param {boolean} shouldRedirect - redirect หากไม่มีสิทธิ์ (default: true)
 * @returns {boolean} - true หากมีสิทธิ์, false หากไม่มีสิทธิ์
 */
function checkPageAccess(pageName, shouldRedirect = true) {
  // ตรวจสอบการ login
  const loggedIn = sessionStorage.getItem("loggedIn");
  const userRole = sessionStorage.getItem("userRole");
  const userName = sessionStorage.getItem("userName") || "ผู้ใช้";
  const userEmail = sessionStorage.getItem("userEmail");

  console.log("🔐 Auth Guard - Checking access:");
  console.log("  Page:", pageName);
  console.log("  Logged in:", loggedIn);
  console.log("  User Role:", userRole);
  console.log("  User Name:", userName);

  // 1️⃣ เช็คว่า login หรือยัง
  if (loggedIn !== "true") {
    console.warn("❌ ไม่ได้ล็อกอิน - Redirecting to login page");
    if (shouldRedirect) {
      alert("⚠️ กรุณาเข้าสู่ระบบก่อนใช้งาน");
      window.location.href = "login_admin.html";
    }
    return false;
  }

  // 2️⃣ เช็คว่ามี role หรือไม่
  if (!userRole) {
    console.error("❌ ไม่พบข้อมูล role - กรุณาล็อกอินใหม่");
    if (shouldRedirect) {
      alert("⚠️ ไม่พบข้อมูลสิทธิ์การใช้งาน\nกรุณาเข้าสู่ระบบใหม่อีกครั้ง");
      sessionStorage.clear();
      window.location.href = "login_admin.html";
    }
    return false;
  }

  // 3️⃣ เช็คสิทธิ์การเข้าถึงหน้านั้นๆ
  const allowedRoles = AUTH_CONFIG[pageName];
  
  // ถ้าไม่มีการกำหนดสิทธิ์สำหรับหน้านี้ = ให้เข้าได้
  if (!allowedRoles) {
    console.log("✅ หน้านี้ไม่มีการจำกัดสิทธิ์ - อนุญาตให้เข้าถึง");
    return true;
  }

  // เช็คว่า role ของผู้ใช้อยู่ในรายการที่อนุญาตหรือไม่
  const hasAccess = allowedRoles.includes(userRole);

  if (hasAccess) {
    console.log(`✅ มีสิทธิ์เข้าถึง - Role: ${userRole}`);
    return true;
  } else {
    console.warn(`❌ ไม่มีสิทธิ์เข้าถึง - Role: ${userRole}`);
    
    if (shouldRedirect) {
      // แสดงข้อความแจ้งเตือนที่ละเอียด
      const roleLabel = getRoleLabel(userRole);
      const requiredRoles = allowedRoles.map(r => getRoleLabel(r)).join(', ');
      
      alert(
        `❌ คุณไม่มีสิทธิ์เข้าถึงหน้านี้\n\n` +
        `👤 ผู้ใช้: ${userName}\n` +
        `📧 อีเมล: ${userEmail || '-'}\n` +
        `🔑 สิทธิ์ปัจจุบัน: ${roleLabel}\n\n` +
        `📋 สิทธิ์ที่อนุญาต: ${requiredRoles}\n\n` +
        `กรุณาติดต่อผู้ดูแลระบบหากต้องการเข้าถึงหน้านี้`
      );
      
      // Redirect กลับไปหน้า dashboard
      window.location.href = "dashboard.html";
    }
    return false;
  }
}

/**
 * 🏷️ แปลง role code เป็นชื่อที่อ่านง่าย
 * @param {string} role - role code
 * @returns {string} - ชื่อ role ภาษาไทย
 */
function getRoleLabel(role) {
  const labels = {
    'super_admin': '👑 Super Admin',
    'content_manager': '📝 Content Manager',
    'user_manager': '👥 User Manager',
    'food_manager': '🍽️ Food Manager',
    'exercise_manager': '💪 Exercise Manager',
    'user': '👤 ผู้ใช้ทั่วไป'
  };
  return labels[role] || role;
}

/**
 * ✅ ตรวจสอบว่าผู้ใช้มีสิทธิ์ใน role ที่กำหนดหรือไม่
 * @param {string|string[]} requiredRoles - role หรือ array ของ roles ที่ต้องการ
 * @returns {boolean} - true หากมีสิทธิ์
 */
function hasPermission(requiredRoles) {
  const userRole = sessionStorage.getItem("userRole");
  
  if (!userRole) return false;
  
  // ถ้าส่งมาเป็น string เดียว
  if (typeof requiredRoles === 'string') {
    return userRole === requiredRoles;
  }
  
  // ถ้าส่งมาเป็น array
  if (Array.isArray(requiredRoles)) {
    return requiredRoles.includes(userRole);
  }
  
  return false;
}

/**
 * 👁️ ซ่อน/แสดงเมนูตามสิทธิ์
 * เรียกใช้ใน DOMContentLoaded ของแต่ละหน้า
 */
function setupMenuPermissions() {
  const userRole = sessionStorage.getItem("userRole");
  
  if (!userRole) {
    console.warn("⚠️ ไม่พบ role - ไม่สามารถตั้งค่าเมนูได้");
    return;
  }

  console.log("🎨 Setting up menu permissions for role:", userRole);

  // ซ่อนเมนูจัดการบทความ (ถ้าไม่ใช่ Super Admin หรือ Content Manager)
  if (!hasPermission(['super_admin', 'content_manager'])) {
    hideMenuLink('articles.html', '📝 จัดการบทความ');
  }

  // ซ่อนเมนูจัดการท่าออกกำลังกาย (ถ้าไม่ใช่ Super Admin หรือ Exercise Manager)
  if (!hasPermission(['super_admin', 'exercise_manager'])) {
    hideMenuLink('exercise_guide.html', '💪 จัดการท่าออกกำลังกาย');
  }

  // ซ่อนเมนูจัดการผู้ใช้ (ถ้าไม่ใช่ Super Admin หรือ User Manager)
  if (!hasPermission(['super_admin', 'user_manager'])) {
    hideMenuLink('manage_users.html', '👥 จัดการผู้ใช้');
    hideMenuLink('admin_management.html', '🔐 จัดการสิทธิ์ผู้ใช้');
  }

  // ซ่อนเมนูจัดการอาหาร (ถ้าไม่ใช่ Super Admin หรือ Food Manager)
  if (!hasPermission(['super_admin', 'food_manager'])) {
    hideMenuLink('food_catalog.html', '🍽️ คลังอาหาร');
  }

  // แสดง role badge ใน sidebar
  displayUserRoleBadge();
}

/**
 * 🙈 ซ่อนลิงก์เมนู
 * @param {string} href - URL ของหน้า
 * @param {string} menuName - ชื่อเมนู (สำหรับ log)
 */
function hideMenuLink(href, menuName) {
  // หาลิงก์ทั้งหมดที่มี href ตรงกัน
  const links = document.querySelectorAll(`a[href="${href}"]`);
  
  if (links.length > 0) {
    links.forEach(link => {
      // ซ่อนทั้ง element
      link.style.display = 'none';
      
      // ซ่อน parent li ด้วย (ถ้ามี)
      const parentLi = link.closest('li');
      if (parentLi) {
        parentLi.style.display = 'none';
      }
    });
    console.log(`  ✓ ซ่อนเมนู: ${menuName}`);
  }
}

/**
 * 🎯 แสดง role badge ของผู้ใช้ใน sidebar
 */
function displayUserRoleBadge() {
  const userRole = sessionStorage.getItem("userRole");
  const userName = sessionStorage.getItem("userName") || "ผู้ใช้";
  
  // หา sidebar logo section
  const logoSection = document.querySelector('.sidebar-logo');
  
  if (logoSection && userRole) {
    // ลบ badge เก่าออก (ถ้ามี)
    const oldBadge = logoSection.querySelector('.user-role-badge');
    if (oldBadge) {
      oldBadge.remove();
    }
    
    // สร้าง badge ใหม่
    const badge = document.createElement('div');
    badge.className = 'user-role-badge';
    badge.style.cssText = `
      margin-top: 10px;
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 20px;
      font-size: 12px;
      color: #fff;
      font-weight: 500;
      text-align: center;
    `;
    badge.textContent = getRoleLabel(userRole);
    
    logoSection.appendChild(badge);
  }
}

/**
 * 🚪 ฟังก์ชัน Logout ที่ปลอดภัย
 */
function secureLogout() {
  if (confirm('🚪 คุณต้องการออกจากระบบหรือไม่?')) {
    console.log("🚪 Logging out...");
    
    // ล้างข้อมูลทั้งหมด
    sessionStorage.clear();
    localStorage.clear();
    
    // Redirect ไปหน้า login
    window.location.href = "login_admin.html";
  }
}

/**
 * 📊 แสดงข้อมูลผู้ใช้ปัจจุบัน (สำหรับ debug)
 */
function showCurrentUserInfo() {
  const userData = {
    loggedIn: sessionStorage.getItem("loggedIn"),
    userId: sessionStorage.getItem("userId"),
    userName: sessionStorage.getItem("userName"),
    userEmail: sessionStorage.getItem("userEmail"),
    userRole: sessionStorage.getItem("userRole")
  };
  
  console.log("👤 Current User Info:", userData);
  return userData;
}

/**
 * 🎨 ตรวจสอบว่าผู้ใช้สามารถแก้ไขเนื้อหาได้หรือไม่
 * @param {string} contentType - ประเภทเนื้อหา ('article', 'exercise', 'food', 'user')
 * @returns {boolean}
 */
function canEditContent(contentType) {
  const permissionMap = {
    'article': ['super_admin', 'content_manager'],
    'exercise': ['super_admin', 'exercise_manager'],
    'food': ['super_admin', 'food_manager'],
    'user': ['super_admin', 'user_manager']
  };
  
  const requiredRoles = permissionMap[contentType];
  if (!requiredRoles) return false;
  
  return hasPermission(requiredRoles);
}

/**
 * 📝 ดึงข้อมูลผู้ใช้จาก sessionStorage
 * @returns {object} - ข้อมูลผู้ใช้
 */
function getCurrentUser() {
  return {
    id: sessionStorage.getItem("userId"),
    name: sessionStorage.getItem("userName"),
    email: sessionStorage.getItem("userEmail"),
    role: sessionStorage.getItem("userRole"),
    isLoggedIn: sessionStorage.getItem("loggedIn") === "true"
  };
}

// 🔄 Auto-check: เช็คว่ายังล็อกอินอยู่หรือไม่ (ทุก 5 นาที)
setInterval(() => {
  const loggedIn = sessionStorage.getItem("loggedIn");
  if (loggedIn !== "true" && !window.location.href.includes('login')) {
    console.warn("⚠️ Session expired - Redirecting to login");
    window.location.href = "login_admin.html";
  }
}, 300000); // 5 minutes

// 🎉 Export functions (ถ้าใช้ ES6 modules)
// export { 
//   checkPageAccess, 
//   hasPermission, 
//   setupMenuPermissions, 
//   secureLogout,
//   canEditContent,
//   getCurrentUser,
//   getRoleLabel
// };

console.log("✅ Auth Guard System v1.1.0 loaded successfully - Exercise Manager support added");