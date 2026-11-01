# KẾ HOẠCH THIẾT KẾ & PHÁT TRIỂN HỆ THỐNG NOVELHUB
> **Đồ án môn học:** Mẫu Thiết Kế Phần Mềm (Software Design Patterns)  
> **Dự án:** Web Đọc và Sáng Tác Truyện NovelHub (Novel Nest)  
> **Tài liệu:** Kế hoạch kiến trúc, giải pháp chức năng & áp dụng mẫu thiết kế (Design Patterns)  
> **Cập nhật:** Bổ sung đặc tả bố cục Diễn đàn & Cơ chế tự động căn chỉnh hình ảnh

---

## MỤC LỤC
1. [Tổng Quan Yêu Cầu & Phạm Vi Công Việc](#1-tổng-quan-yêu-cầu--phạm-vi-công-việc)
2. [Thiết Kế Kiến Trúc & Áp Dụng Mẫu Thiết Kế (Design Patterns)](#2-thiết-kế-kiến-trúc--áp-dụng-mẫu-thiết-kế-design-patterns)
3. [Thiết Kế Cơ Sở Dữ Liệu & Phân Quyền (RBAC)](#3-thiết-kế-cơ-sở-dữ-liệu--phân-quyền-rbac)
4. [Kế Hoạch Chi Tiết Từng Tính Năng](#4-kế-hoạch-chi-tiết-từng-tính-năng)
   - 4.1. Hệ thống Phân Quyền, Tài Khoản Admin & Duyệt Tác Giả
   - 4.2. Thanh Điều Hướng (Navbar) & Menu Quản Trị Viên
   - 4.3. Đặc Tả Chi Tiết Chức Năng Quản Trị Viên (Admin Portal)
   - 4.4. Chức Năng Sửa Cốt Truyện & Xóa Truyện
   - 4.5. Chức Năng Xóa Bài Viết Diễn Đàn
   - 4.6. Thiết Kế Lại Bố Cục Profile & Cập Nhật Thông Tin Cá Nhân
   - 4.7. Thiết Kế Bố Cục Hiển Thị Bài Viết Diễn Đàn & Profile (Căn Chỉnh Ảnh Tự Động)
5. [Đặc Tả API Backend Cần Triển Khai](#5-đặc-tả-api-backend-cần-triển-khai)
6. [Lộ Trình Triển Khai (Roadmap)](#6-lộ-trình-triển-khai-roadmap)
7. [Tiêu Chí Nghiệm Thu (Acceptance Criteria)](#7-tiêu-chí-nghiệm-thu-acceptance-criteria)

---

## 1. TỔNG QUAN YÊU CẦU & PHẠM VI CÔNG VIỆC

Theo định hướng yêu cầu từ đồ án, hệ thống cần nâng cấp các phân hệ quan trọng sau:

| STT | Phân hệ / Tính năng | Mô tả tóm tắt |
|:---:|:---|:---|
| 1 | **Phân quyền RBAC (Role-Based Access Control)** | Thiết lập 3 vai trò: `user` (độc giả mặc định), `author` (tác giả sáng tác), `admin` (quản trị viên). |
| 2 | **Tài khoản Admin khởi tạo** | Tài khoản định danh: `Admin123`, mật khẩu: `Admin123`. |
| 3 | **Quy trình Duyệt Tác Giả** | Người dùng gửi đơn xin làm tác giả từ trang Profile; Admin phê duyệt hoặc từ chối tại trang Quản trị viên. |
| 4 | **Menu Quản Trị trên Navbar** | Nằm giữa **Diễn đàn** và **Hồ sơ**, chỉ hiển thị khi tài khoản Admin đăng nhập. |
| 5 | **Trang Quản Trị Viên (Admin Portal)** | Bảng điều khiển quản lý: Thống kê, Duyệt đơn tác giả, Quản lý toàn bộ truyện, Quản lý diễn đàn, Quản lý người dùng. |
| 6 | **Quản lý Truyện (Sửa cốt truyện & Xóa truyện)** | - Trong Profile: Tác giả hoặc Admin có thể sửa tóm tắt (cốt truyện) hoặc xóa truyện của mình.<br>- Trong Admin Portal: Admin có quyền sửa cốt truyện hoặc xóa bất kỳ truyện nào. |
| 7 | **Xóa bài viết trên Diễn đàn** | Tác giả bài viết hoặc Admin mới có quyền xóa bài đăng (trên Diễn đàn, Profile và Admin Portal). |
| 8 | **Đổi Avatar, Tên & Mật khẩu** | - Icon đổi avatar trực tiếp gần ảnh đại diện trong Profile.<br>- Đổi tên hiển thị.<br>- Đổi mật khẩu (chặn đối với tài khoản đăng nhập bằng Google). |
| 9 | **Thiết kế lại Bố cục Profile** | Hiện đại hóa toàn diện giao diện cá nhân theo phong cách Dashboard đa năng. |
| 10 | **Tái Cấu Trúc Bố Cục Bài Viết Diễn Đàn & Profile** *(Mới)* | - Phân cấp chuẩn: Avatar $\rightarrow$ Tên người đăng & Ngày tháng năm $\rightarrow$ Nội dung bài đăng $\rightarrow$ Hình ảnh đính kèm.<br>- **Hình ảnh tự động căn chỉnh vừa vặn khung hình** (Auto-fit responsive), không vỡ/méo tỉ lệ trên cả Diễn đàn và Profile. |

---

## 2. THIẾT KẾ KIẾN TRÚC & ÁP DỤNG MẪU THIẾT KẾ (DESIGN PATTERNS)

Vì dự án thuộc môn học **Mẫu Thiết Kế Phần Mềm**, kế hoạch kiến trúc sẽ áp dụng các mẫu thiết kế chuẩn GoF (Gang of Four) vào cả Backend và Frontend:

```
                            KIẾN TRÚC TỔNG THỂ HỆ THỐNG
   
   [ Client: React + Vite ] ──(Observer: Context API)──> [ State & Re-render UI ]
              │
              ├── (Template Method Pattern) ──> Khung hiển thị bài viết chuẩn hóa (Forum & Profile)
              ├── (Adapter Pattern) ──────────> Google OAuth / Form Login Normalizer
              ├── (Composite Pattern) ────────> Bố cục Profile & Admin Layout
              │
              ▼ [ RESTful API Request ]
   ══════════════════════════════════════════════════════════════════════════════
   [ Backend: Node.js / Express ]
              │
              ├── (Chain of Responsibility Pattern) ─> Middleware Pipeline:
              │     [ verifyToken ] ──> [ checkRole ] ──> [ checkOwnership ]
              │
              ├── (Factory Method Pattern) ───────────> Role & Permission Factory
              ├── (Strategy Pattern) ─────────────────> Auth Strategy (Local vs Google)
              ├── (State Pattern) ────────────────────> AuthorRequest State (Pending, Approved, Rejected)
              ├── (Facade Pattern) ───────────────────> AdminNovelDeleteFacade (Cascade delete)
              └── (Singleton Pattern) ────────────────> Database Connection & Cloudinary Service
```

### 2.1. Nhóm Creational Patterns (Mẫu Khởi Tạo)
*   **Factory Method Pattern**:
    *   *Áp dụng*: Tạo lớp `UserFactory` hoặc `RolePolicyFactory`. Khi khởi tạo tài khoản hoặc xử lý logic phân quyền, Factory sẽ trả về đối tượng phân quyền tương ứng (`AdminPolicy`, `AuthorPolicy`, `StandardUserPolicy`) chứa danh sách quyền (permissions: `canEditAnyNovel`, `canDeleteAnyPost`, `canPublishNovel`,...).
*   **Singleton Pattern**:
    *   *Áp dụng*: Kết nối MongoDB Mongoose (`dbConnection`), Cloudinary Uploader Instance và Axios API client trên frontend để duy trì một phiên làm việc tập trung duy nhất, tránh tạo dư thừa kết nối.

### 2.2. Nhóm Structural Patterns (Mẫu Cấu Trúc)
*   **Decorator / Middleware Pattern**:
    *   *Áp dụng*: Hệ thống Express Middlewares bọc (decorate) các route xử lý:
        *   `isLoggedIn`: Xác thực danh tính JWT.
        *   `authorizeRoles(['admin'])`: Kiểm tra quyền quản trị.
        *   `checkOwnership(Model, field)`: Kiểm tra quyền sở hữu bài viết/truyện hoặc quyền bypass của Admin.
*   **Adapter Pattern**:
    *   *Áp dụng*: `AuthAdapter` chuẩn hóa cấu trúc dữ liệu người dùng từ 2 nguồn: Đăng nhập truyền thống (Local username/email + password) và Google OAuth (Google User Profile) thành một chuẩn chung `AuthUserDTO` để tầng ứng dụng xử lý thống nhất.
*   **Facade Pattern**:
    *   *Áp dụng*: `NovelManagementFacade`. Khi xóa một tác phẩm, quy trình cần thực hiện nhiều hành động liên tầng: Xóa file ảnh bìa/video trên Cloudinary, xóa các chương thuộc truyện (`Chapter.deleteMany`), xóa tất cả đánh giá liên quan (`Review.deleteMany`), rút trích ID khỏi mảng `likedNovels` của người dùng, rút trích ID khỏi mảng `novels` của tác giả. Facade cung cấp một phương thức duy nhất `deleteNovelCompletely(novelId)` để ẩn giấu độ phức tạp này.
*   **Composite Pattern**:
    *   *Áp dụng*: Thiết kế giao diện Profile và Admin Panel trên React. Các Widget thống kê, Tab nội dung, Card truyện, Card bài viết được cấu thành theo dạng cây phân cấp (Component Tree), giúp tái sử dụng linh hoạt giữa Profile cá nhân và Dashboard quản trị.

### 2.3. Nhóm Behavioral Patterns (Mẫu Hành Vi)
*   **Template Method Pattern** *(Mới)*:
    *   *Áp dụng cho việc hiển thị bài viết*: Định nghĩa một cấu trúc hiển thị bộ khung chuẩn (`PostLayoutTemplate`) gồm các bước cố định:
        1. `renderHeader()`: Avatar người đăng $\rightarrow$ Tên tác giả & Ngày tháng $\rightarrow$ Menu thao tác (Xóa bài).
        2. `renderBody()`: Tiêu đề và nội dung bài viết.
        3. `renderMedia()`: Khung ảnh tự động căn chỉnh tỉ lệ (Auto-fit frame).
        4. `renderFooter()`: Nút like, lượt bình luận.
        Cả trang Diễn đàn (`ForumPage.jsx`) và trang Cá nhân (`UserPosts.jsx`) đều áp dụng chung bộ khung này, đảm bảo giao diện đồng bộ, không bị xô lệch bố cục.
*   **Strategy Pattern**:
    *   *Chiến lược xác thực mật khẩu*: Tách biệt logic xác thực tài khoản:
        *   `LocalPasswordAuthStrategy`: So khớp bcrypt hash, hỗ trợ đổi mật khẩu.
        *   `GoogleOAuthStrategy`: Kiểm tra Google token, chặn việc đổi mật khẩu trực tiếp trong hệ thống.
*   **State Pattern**:
    *   *Vòng đời yêu cầu tác giả*: Bản ghi `AuthorRequest` chuyển trạng thái linh hoạt:
        *   `PendingState`: Đang chờ admin duyệt, user không thể gửi thêm đơn mới.
        *   `ApprovedState`: Admin chấp thuận, tự động kích hoạt vai trò `author`.
        *   `RejectedState`: Admin từ chối kèm lý do, user được phép gửi lại đơn sau khi khắc phục.
*   **Observer Pattern**:
    *   *Áp dụng*: React Context (`AuthContext`, `DarkModeContext`). Khi tài khoản đăng nhập hoặc quyền hạn (role) thay đổi sau khi được duyệt, tất cả các Observer (Navbar, ProtectedRoute, Profile) sẽ tự động cập nhật trạng thái mà không cần reload trang.
*   **Chain of Responsibility Pattern**:
    *   *Áp dụng*: Chuỗi xác thực trong Express Request Pipeline:
        `Request` $\rightarrow$ `VerifyTokenHandler` $\rightarrow$ `CheckUserStatusHandler` $\rightarrow$ `CheckResourceOwnershipHandler` $\rightarrow$ `ExecuteControllerAction`.

---

## 3. THIẾT KẾ CƠ SỞ DỮ LIỆU & PHÂN QUYỀN (RBAC)

### 3.1. Cập Nhật Bảng Người Dùng (`User`)
Bổ sung các trường quản lý nguồn gốc đăng nhập và trạng thái:
```javascript
// backend/models/User.js
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['user', 'author', 'admin'],
    default: 'user' // Mọi tài khoản mới luôn là 'user'
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local' // Đánh dấu tài khoản tạo bằng email/mật khẩu hay Google
  },
  userimage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167'
  },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  likedNovels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Novel' }]
}, { timestamps: true });
```

### 3.2. Mô Hình Mới: Đơn Yêu Cầu Tác Giả (`AuthorRequest`)
Thay thế cơ chế tự động nâng cấp hiện tại bằng bảng duyệt đơn có kiểm soát:
```javascript
// backend/models/AuthorRequest.js
const authorRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Một user chỉ được có 1 đơn đang xử lý
  },
  penName: { type: String, required: true, trim: true },
  bio: { type: String, trim: true, default: '' },
  reason: { type: String, trim: true }, // Lý do muốn sáng tác / tác phẩm tiêu biểu
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNote: { type: String, default: '' }, // Ghi chú từ Admin khi duyệt/từ chối
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date }
}, { timestamps: true });
```

### 3.3. Ma Trận Phân Quyền (RBAC Matrix)

| Chức năng hệ thống | Khách (Guest) | Độc giả (`user`) | Tác giả (`author`) | Quản trị (`admin`) |
|:---|:---:|:---:|:---:|:---:|
| Đọc truyện, xem diễn đàn, tìm kiếm | Có | Có | Có | Có |
| Bình luận, like truyện, like bài viết | Không | Có | Có | Có |
| Đăng bài viết trên diễn đàn | Không | Có | Có | Có |
| **Xóa bài viết của chính mình** | Không | **Có** | **Có** | **Có** |
| **Xóa bài viết của người khác** | Không | Không | Không | **Có** |
| Gửi đơn xin cấp quyền tác giả | Không | Có | Không (đã là tác giả) | Không |
| Đăng truyện mới, tạo chương mới | Không | Không | Có | Có |
| **Sửa cốt truyện / Xóa truyện của mình** | Không | Không | **Có** | **Có** |
| **Sửa cốt truyện / Xóa truyện của người khác**| Không | Không | Không | **Có** |
| **Truy cập Trang Quản Trị Viên (Admin Portal)**| Không | Không | Không | **Có** |
| Duyệt / từ chối đơn yêu cầu tác giả | Không | Không | Không | **Có** |

---

## 4. KẾ HOẠCH CHI TIẾT TỪNG TÍNH NĂNG

### 4.1. Hệ Thống Phân Quyền, Tài Khoản Admin & Duyệt Tác Giả

#### A. Khởi Tạo Tài Khoản Admin Mặc Định
*   **Thông tin**:
    *   Tài khoản đăng nhập: `Admin123` (hoặc email `Admin123@novelhub.com`, tên đăng nhập `Admin123`).
    *   Mật khẩu: `Admin123`.
    *   Vai trò: `admin`.
*   **Cơ chế thực hiện (Automated Seeder)**:
    *   Xây dựng script `backend/utils/seedAdmin.js`.
    *   Khi ứng dụng backend khởi động (`index.js` kết nối DB thành công), seeder kiểm tra sự tồn tại của tài khoản có email/username `Admin123` hoặc role `admin`. Nếu chưa có, tiến hành hash mật khẩu bằng `bcryptjs` và lưu vào MongoDB.
    *   Cập nhật `loginUser` controller: Cho phép đăng nhập linh hoạt bằng cả `email` hoặc username `Admin123`.

#### B. Quy Trình Xét Duyệt Tác Giả (State Workflow)
```
[User Profile] ────────> [Gửi Form Đăng Ký] ────────> [Tạo AuthorRequest: "pending"]
                                                                   │
                                                                   ▼
[User Profile: Đơn chờ duyệt] <──────────── Thông báo ────── [Admin Portal]
                                                                   │
                         ┌─────────────────────────────────────────┴─────────────────────────────────────────┐
                         ▼                                                                                   ▼
             [Admin bấm: DUYỆT (Approve)]                                                         [Admin bấm: TỪ CHỐI (Reject)]
                         │                                                                                   │
        - Cập nhật trạng thái: "approved"                                                   - Cập nhật trạng thái: "rejected"
        - Tạo bản ghi mới trong bảng `Author`                                               - Lưu lý do từ chối vào `adminNote`
        - Cập nhật `user.role = 'author'`                                                   - User có thể xem lý do & gửi lại
        - Đồng bộ lại token / session
```

---

### 4.2. Thanh Điều Hướng (Navbar) & Menu Quản Trị Viên

#### A. Vị Trí Hiển Thị Trên Navbar
*   Theo cấu trúc hiện tại và ảnh giao diện thực tế:
    `[Logo Novel Nest]` ── `[Ô tìm kiếm]` ── `[Bảng xếp hạng]` ── `[Diễn đàn]` ── **`[Quản trị viên]`** ── `[Hồ sơ]` ── `[Theme]` ── `[Đăng xuất]`
*   Nút **Quản trị viên** được đặt **chính xác ở vị trí giữa "Diễn đàn" và "Hồ sơ"**.

#### B. Điều Kiện Hiển Thị (Conditional Rendering)
*   Chỉ render mục này khi:
    ```javascript
    {isAuthenticated() && loggedUser?.role === 'admin' && (
      <button
        onClick={() => navigate("/admin")}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-purple-400 bg-purple-900/30 border border-purple-500/40 hover:bg-purple-800/50 transition-all duration-300"
      >
        <FaShieldAlt className="text-lg text-purple-400" />
        <span>Quản trị viên</span>
      </button>
    )}
    ```
*   Tài khoản `user`, `author` hoặc khách chưa đăng nhập hoàn toàn không nhìn thấy nút này trên cả phiên bản Desktop lẫn Mobile Menu.
*   **Route Guard (`AdminRoute.jsx`)**: Bọc quanh đường dẫn `/admin/*`. Nếu người dùng cố tình nhập URL trực tiếp mà role không phải `admin`, hệ thống điều hướng về `/home` hoặc hiển thị trang `403 Forbidden`.

---

### 4.3. Đặc Tả Chi Tiết Chức Năng Quản Trị Viên (Admin Portal)

Trang Quản trị viên (`/admin`) được thiết kế trực quan theo dạng Sidebar + Dashboard Content gồm 5 phân hệ lớn:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ NOVEL NEST - BẢNG ĐIỀU KHIỂN QUẢN TRỊ VIÊN                                      [Admin123] [Đăng xuất] │
├────────────────┬────────────────────────────────────────────────────────────────────────────────┤
│ 📊 Tổng quan   │ 1. TỔNG QUAN HỆ THỐNG                                                         │
│ 📝 Duyệt đơn   │ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│ 📚 Quản lý truyện│ │ 1,250 User   │  │ 48 Tác giả   │  │ 120 Truyện   │  │ 350 Bài viết │         │
│ 💬 Diễn đàn    │ └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘         │
│ 👥 Người dùng  │ Biểu đồ thống kê tăng trưởng, hoạt động gần đây                                │
│                ├────────────────────────────────────────────────────────────────────────────────┤
│                │ 2. NỘI DUNG TỪNG PHÂN HỆ CHI TIẾT THEO TAB                                     │
└────────────────┴────────────────────────────────────────────────────────────────────────────────┘
```

#### Phân hệ 1: Tổng Quan & Thống Kê (Dashboard Overview)
*   Thống kê 4 chỉ số chính dạng thẻ (Cards): Tổng người dùng, Tổng số tác giả, Tổng số truyện, Tổng bài viết diễn đàn.
*   Danh sách tác phẩm mới đăng gần đây và các bài viết mới cần giám sát nội dung.

#### Phân hệ 2: Quản Lý Đơn Xin Làm Tác Giả (Author Applications)
*   Danh sách các đơn yêu cầu với các tab: `Chờ duyệt (Pending)`, `Đã duyệt (Approved)`, `Đã từ chối (Rejected)`.
*   Thông tin mỗi đơn: Avatar, Tên tài khoản, Email, Bút danh mong muốn, Bio giới thiệu, Ngày gửi.
*   **Hành động**:
    *   Nút **"Phê duyệt"**: Xác nhận nâng cấp vai trò thành `author`, tự động tạo hồ sơ tác giả.
    *   Nút **"Từ chối"**: Mở modal nhập lý do (ví dụ: Bút danh không hợp lệ, thông tin chưa đầy đủ) để gửi phản hồi cho người dùng.

#### Phân hệ 3: Quản Lý Toàn Bộ Truyện (Novel Moderation)
*   Bảng dữ liệu danh sách tất cả các truyện trên nền tảng (tìm kiếm theo tên truyện, lọc theo tác giả).
*   Các thông tin: Ảnh bìa, Tên tác phẩm, Tác giả, Số chương, Lượt thích, Ngày tạo.
*   **Quyền hạn tối cao của Admin**:
    *   **Nút "Sửa cốt truyện"**: Mở modal biên tập lại tiêu đề và nội dung tóm tắt/cốt truyện (`description`), cập nhật lại ảnh bìa nếu vi phạm thuần phong mỹ tục.
    *   **Nút "Xóa truyện"**: Xóa bất kỳ truyện nào khỏi hệ thống (kèm modal cảnh báo xác nhận, dọn dẹp triệt để liên kết dữ liệu theo Facade Pattern).

#### Phân hệ 4: Quản Lý Diễn Đàn & Kiểm Duyệt Bài Viết (Forum Moderation)
*   Danh sách tất cả các bài viết cộng đồng (Post) từ người dùng.
*   Xem nhanh nội dung, hình ảnh đính kèm, tác giả bài viết, số lượng comment và lượt like.
*   **Nút "Xóa bài viết"**: Admin có quyền xóa ngay lập tức các bài đăng spam, độc hại hoặc vi phạm quy định.

#### Phân hệ 5: Quản Lý Người Dùng (User Management)
*   Danh sách người dùng, hiển thị vai trò (`user`, `author`, `admin`), phương thức đăng nhập (`local` hoặc `google`).
*   Tính năng tìm kiếm tài khoản, xem lịch sử bài đăng, điều chỉnh vai trò trực tiếp nếu cần.

---

### 4.4. Chức Năng Sửa Cốt Truyện & Xóa Truyện

#### A. Trong Trang Cá Nhân (Profile / Dashboard)
*   **Đối tượng hiển thị**: Hiển thị trong Tab **"Truyện của bạn"** (`AuthorSection.jsx`) dành cho Tác giả (`author`) hoặc Admin.
*   **Giao diện mỗi thẻ truyện**: Bổ sung menu thao tác hoặc cặp nút hành động:
    1.  **Nút Sửa Cốt Truyện (Edit Synopsis)**:
        *   Biểu tượng cây bút (`FaEdit`).
        *   Bấm vào mở Modal **"Chỉnh sửa thông tin tác phẩm"**:
            *   Trường Tên truyện (`title`).
            *   Trường Cốt truyện / Tóm tắt nội dung (`description` - Textarea lớn hỗ trợ định dạng).
            *   Tùy chọn tải ảnh bìa mới (nếu muốn thay thế).
        *   Gửi request `PUT /novels/:id` lên backend.
    2.  **Nút Xóa Truyện (Delete Novel)**:
        *   Biểu tượng thùng rác màu đỏ (`FaTrashAlt`).
        *   Bấm vào kích hoạt **Modal Xác Nhận Nguy Hiểm**:
            > *"Bạn có chắc chắn muốn xóa tác phẩm này? Mọi chương truyện và đánh giá liên quan sẽ bị xóa vĩnh viễn và không thể khôi phục."*
        *   Nhập chữ "XÓA" hoặc bấm nút xác nhận $\rightarrow$ Gọi API `DELETE /novels/:id`.
        *   Cập nhật mảng state `novelsData` ngay trên giao diện mà không cần reload trang.

#### B. Trong Trang Quản Trị Viên (Admin Portal)
*   Trong bảng danh sách truyện của Admin Portal, mỗi hàng truyện đều có 2 nút: **[Chỉnh sửa]** và **[Xóa]**.
*   Admin có toàn quyền chỉnh sửa cốt truyện hoặc xóa truyện của bất kỳ tác giả nào.

#### C. Cơ Chế Kiểm Tra Quyền Hạn Ở Backend (Chain of Responsibility)
*   Middleware `checkNovelOwner`:
    ```javascript
    // Kiểm tra: Nếu req.user.role === 'admin' => Cho phép đi tiếp (Bypass)
    // Nếu là tác giả thông thường => Kiểm tra xem novel.author.user === req.user.userId
    // Nếu không khớp => Trả về 403 Forbidden.
    ```

---

### 4.5. Chức Năng Xóa Bài Viết Diễn Đàn

#### A. Vị Trí & Điều Kiện Hiển Thị
1.  **Trên Trang Diễn Đàn (`ForumPage.jsx`)**:
    *   Ở góc trên bên phải của từng thẻ bài viết (`Post Card`), bổ sung nút **Xóa bài** (icon `FaTrash`).
    *   *Điều kiện hiển thị*:
        ```javascript
        const canDelete = loggedUser && (
          loggedUser._id === post.user._id || 
          loggedUser.role === 'admin'
        );
        ```
2.  **Trong Trang Cá Nhân (`UserPosts.jsx`)**:
    *   Trong tab "Bài viết" của Profile, kích hoạt nút ba chấm (`FaEllipsisV`) hoặc nút thùng rác trực tiếp để người dùng quản lý và xóa các bài viết mình đã đăng.
3.  **Trong Admin Portal**:
    *   Tại tab "Quản lý Diễn đàn", Admin có thể bấm nút xóa bài viết bất kỳ.

#### B. Trải Nghiệm Người Dùng (UX Flow)
*   Khi bấm nút Xóa $\rightarrow$ Hiển thị Toast/Modal xác nhận: *"Xác nhận xóa bài viết này khỏi diễn đàn?"*.
*   Bấm Xác nhận $\rightarrow$ Gửi request `DELETE /posts/:id`.
*   Sau khi backend xử lý thành công, sử dụng hiệu ứng Animation của `framer-motion` để trượt bài viết mờ dần và biến mất khỏi danh sách.

---

### 4.6. Thiết Kế Lại Bố Cục Profile & Cập Nhật Thông Tin Cá Nhân

#### A. Thiết Kế Tổng Thể Bố Cục Mới (Modern Glassmorphism UI)
Bố cục được tái cấu trúc thành 3 khối chính mang phong cách thẩm mỹ cao, trực quan và tiện ích:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [1] PROFILE HERO BANNER                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ [Ảnh bìa nghệ thuật phong cách Manga / Fantasy]                                            │ │
│ │                                                                                             │ │
│ │  ┌──────────────┐   Linh Việt  (⭐ Tác giả / 🛡️ Admin / 📖 Độc giả)                         │ │
│ │  │ [AVATAR]     │   Email: linhviet@gmail.com • Tham gia: 12/2025                           │ │
│ │  │   [📷 Icon]  │                                                                           │ │
│ │  └──────────────┘   [✏️ Chỉnh sửa hồ sơ]   [🔒 Đổi mật khẩu]   [📝 Đăng ký Tác giả]         │ │
│ └─────────────────────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [2] THẺ THỐNG KÊ NHANH (QUICK STAT METRICS)                                                     │
│ ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│ │ 📚 Truyện sáng tác│  │ 💬 Bài viết thảo luận│ │ ❤️ Truyện yêu thích│ │ 🏆 Cấp độ / Vai trò│          │
│ │        12        │  │        28        │  │        45        │  │     Tác giả      │          │
│ └──────────────────┘  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [3] TABBED CONTENT WORKSPACE                                                                    │
│ [ 📚 Truyện của tôi (Author) ]   [ 💬 Bài viết của tôi ]   [ ❤️ Truyện đã thích ]   [ ⚙️ Cài đặt ]│
│                                                                                                 │
│  Hiển thị danh sách tác phẩm hoặc bài viết tương ứng với đầy đủ công cụ quản lý.                │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### B. Nút Thay Đổi Ảnh Đại Diện (Avatar Change)
*   **Vị trí**: Một nút icon máy ảnh/bút chì tròn nhỏ (`FaCamera`) nằm đè lên góc dưới bên phải của Avatar.
*   **Cơ chế hoạt động**:
    *   Bên dưới icon là input ẩn: `<input type="file" accept="image/*" className="hidden" />`.
    *   Khi người dùng click vào icon, kích hoạt mở file picker của máy tính.
    *   Chọn ảnh xong $\rightarrow$ Hiển thị modal xem trước (Preview) với tùy chọn căn chỉnh.
    *   Bấm "Lưu ảnh" $\rightarrow$ Gửi `FormData` chứa file ảnh đến API `PUT /users/avatar`.
    *   Backend tải ảnh lên Cloudinary, cập nhật trường `userimage` trong DB và trả về URL ảnh mới.
    *   Cập nhật lại ảnh đại diện trong `AuthContext` ngay lập tức.

#### C. Chỉnh Sửa Tên Hiển Thị (Display Name)
*   Nút "Chỉnh sửa tên" hoặc icon cây bút cạnh tên hiển thị.
*   Cho phép người dùng sửa `name` (tối thiểu 3 ký tự, không chứa ký tự đặc biệt gây lỗi).
*   Gửi request `PUT /users/profile` để lưu tên mới.

#### D. Chức Năng Đổi Mật Khẩu & Xử Lý Đối Với Tài Khoản Google
*   **Quy tắc đặc thù**: **Không cho phép đổi mật khẩu khi đăng nhập bằng Google**.
*   **Giải pháp thiết kế**:
    *   Trong User Model, trường `authProvider` nhận giá trị `'google'` hoặc `'local'`.
    *   **Trường hợp 1 (Tài khoản Google)**:
        *   Trong phần cài đặt bảo mật của Profile, mục "Đổi mật khẩu" sẽ được làm mờ (disabled) hoặc thay thế bằng thông báo trang nhã:
        > *"ℹ️ Bạn đang đăng nhập bằng tài khoản Google. Mật khẩu được bảo vệ an toàn bởi Google và không thể thay đổi tại đây."*
        *   Đồng thời ở Backend: API đổi mật khẩu kiểm tra nếu `user.authProvider === 'google'`, từ chối ngay với mã lỗi `400 Bad Request` kèm thông báo tương ứng.
    *   **Trường hợp 2 (Tài khoản thông thường - Local)**:
        *   Mở modal Đổi mật khẩu gồm 3 ô nhập:
            1.  Mật khẩu hiện tại.
            2.  Mật khẩu mới (tối thiểu 6 ký tự).
            3.  Xác nhận mật khẩu mới.
        *   Kiểm tra mật khẩu cũ chính xác bằng `bcrypt.compare`, sau đó mã hóa mật khẩu mới và lưu lại.

---

### 4.7. Thiết Kế Bố Cục Hiển Thị Bài Viết Diễn Đàn & Profile (Căn Chỉnh Ảnh Tự Động)

Theo yêu cầu bổ sung, giao diện bài viết trên **Diễn đàn (`ForumPage.jsx`)** và danh sách bài viết trong **Profile (`UserPosts.jsx`)** cần được cấu trúc lại hoàn toàn theo phân cấp thị giác trực quan, khoa học:

#### A. Cấu Trúc Bố Cục Phân Cấp (Visual Hierarchy)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [1. HEADER BÀI VIẾT]                                                                            │
│ ┌──────────┐  Linh Việt (Tác giả)                                           [🗑️ Xóa bài]        │
│ │ [AVATAR] │  📅 01 Tháng 11, 2026 lúc 10:30 • (Cách đây 2 giờ)                                 │
│ └──────────┘                                                                                    │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [2. THÂN BÀI VIẾT: TIÊU ĐỀ & NỘI DUNG]                                                          │
│ 📌 Chuẩn bị ra mắt Chương 3 của bộ Tiên Nghịch!                                                 │
│                                                                                                 │
│ Xin chào các bạn độc giả, chương 3 đang trong giai đoạn biên tập cuối cùng.                     │
│ Dự kiến tối nay sẽ lên sóng với nhiều tình tiết gay cấn...                                      │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [3. HÌNH ẢNH ĐÍNH KÈM: AUTO-FIT RESPONSIVE FRAME]                                               │
│ ┌─────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │                                                                                             │ │
│ │                   [ HÌNH ẢNH TỰ ĐỘNG CĂN CHỈNH VỪA KHÍT KHUNG HÌNH ]                        │ │
│ │                (Không bị méo tỉ lệ, không bị cắt xén, max-h: 500px)                         │ │
│ │                                                                                             │ │
│ └─────────────────────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [4. FOOTER TƯƠNG TÁC]                                                                           │
│ ❤️ 24 Yêu thích          💬 8 Bình luận                                      🔗 Chia sẻ         │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

#### B. Chi Tiết Từng Phần Hiển Thị

1.  **Phần 1: Header bài viết (Avatar + Thông tin người đăng)**:
    *   **Avatar người đăng bài**:
        *   Kích thước chuẩn: `w-12 h-12` (48px) tròn đều (`rounded-full`), viền mỏng tinh tế (`border-2 border-purple-500/30`), hỗ trợ hiệu ứng bóng mờ nhẹ (`shadow-md`).
        *   Ảnh lấy từ `post.user.userimage`; nếu người dùng chưa có ảnh, hiển thị avatar mặc định hoặc chữ cái đầu của tên trên nền gradient bắt mắt.
    *   **Tên người đăng bài**:
        *   Font chữ đậm (`font-semibold text-base md:text-lg`), màu chữ nổi bật tương phản cao với nền sáng/tối.
        *   Có huy hiệu vai trò nhỏ bên cạnh (Badge: `Admin`, `Tác giả`, `Độc giả`).
    *   **Ngày tháng năm đăng bài**:
        *   Đặt ngay phía dưới tên người đăng bài với font chữ nhỏ hơn (`text-xs md:text-sm text-gray-500 dark:text-gray-400`).
        *   Định dạng ngày tháng năm rõ ràng bằng tiếng Việt (ví dụ: `01/11/2026 10:30` hoặc `01 Tháng 11, 2026`).
    *   **Nút Thao Tác (Xóa bài viết)**:
        *   Đặt ở góc trên bên phải của Header.
        *   Chỉ hiển thị nếu người dùng hiện tại là chủ bài viết (`post.user._id === loggedUser._id`) hoặc là `admin`.

2.  **Phần 2: Thân bài viết (Nội dung văn bản)**:
    *   Đặt **ngay bên dưới phần Header**, trước khi đến hình ảnh.
    *   **Tiêu đề bài viết (`title`)**: Chữ in đậm, cỡ chữ lớn, tạo điểm nhấn chủ đề thảo luận.
    *   **Nội dung bài viết (`content`)**:
        *   Hỗ trợ xuống dòng tự nhiên (`whitespace-pre-wrap`), khoảng cách dòng thoáng đãng (`leading-relaxed`), chống tràn chữ (`break-words`).

3.  **Phần 3: Khung hình ảnh tự động căn chỉnh (Auto-Fit Responsive Media Frame)**:
    *   **Vấn đề thực tế trước đây**:
        *   Dùng `object-cover` cố định chiều cao dẫn đến việc ảnh dọc (ảnh poster/truyện) bị cắt mất đầu đuôi, còn ảnh ngang góc rộng bị phóng to vỡ nét.
        *   Trong Profile (`UserPosts.jsx`), ảnh bị ép cứng vào khung `h-56` khiến bố cục méo mó, không đồng nhất.
    *   **Giải pháp kỹ thuật tự động căn chỉnh (Auto-Fit Solution)**:
        *   **Khung Container bao ngoài**:
            *   Chiều rộng: 100% chiều rộng bài viết (`w-full`).
            *   Giới hạn chiều cao an toàn: `max-h-[500px]` (trên desktop) và `max-h-[380px]` (trên mobile), đảm bảo ảnh không chiếm trọn toàn bộ màn hình khiến người đọc phải cuộn quá nhiều.
            *   Phông nền mờ trung tính: `bg-gray-100 dark:bg-gray-800/60 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-200/50 dark:border-gray-700/50`.
        *   **Thuộc tính căn chỉnh của thẻ `<img>`**:
            *   Sử dụng: `max-w-full max-h-[500px] w-auto h-auto object-contain rounded-xl transition-all duration-300`.
            *   Hiệu quả:
                - Ảnh ngang (Landscape 16:9, 4:3): Vừa vặn chiều rộng khung, chiều cao tự động co lại đúng tỉ lệ gốc.
                - Ảnh dọc (Portrait 9:16, bìa truyện dài): Vừa vặn chiều cao tối đa `500px`, chiều ngang tự động thu gọn vào giữa, hai bên hiển thị nền mờ đồng điệu sang trọng.
                - Ảnh vuông (1:1): Căn giữa hoàn hảo, hiển thị 100% chi tiết không mất bất kỳ góc cạnh nào.
        *   **Hiệu ứng bổ sung (Lightbox Zoom)**:
            *   Bấm vào ảnh sẽ mở popup xem ảnh kích thước gốc (Full-size modal) kèm nút đóng hoặc zoom in/out.

4.  **Phần 4: Chân bài viết (Interaction Footer)**:
    *   Nút Thích (`FaHeart` / `FaRegHeart`) kèm bộ đếm số lượt like.
    *   Nút Bình luận (`FaComment`) kèm số lượng phản hồi và ô nhập bình luận nhanh bên dưới.

#### C. Áp Dụng Đồng Bộ Giữa Diễn Đàn & Trang Cá Nhân (Profile)
*   **Trên Diễn đàn (`ForumPage.jsx`)**: Danh sách bài viết dạng luồng thảo luận (Feed Stream).
*   **Trong Profile (`UserPosts.jsx`)**:
    *   Thay đổi cách hiển thị từ dạng Card nhỏ bị co quắp sang dạng Card tiêu chuẩn danh sách dòng thời gian (Timeline List).
    *   Đảm bảo đầy đủ: Avatar $\rightarrow$ Tên & Ngày giờ $\rightarrow$ Nội dung $\rightarrow$ Khung ảnh auto-fit $\rightarrow$ Nút Xóa bài viết cá nhân.

---

## 5. ĐẶC TẢ API BACKEND CẦN TRIỂN KHAI

### 5.1. Nhóm Xác Thực & Người Dùng (`/users`)
*   `POST /auth/login`: Hỗ trợ đăng nhập bằng cả email hoặc username `Admin123`.
*   `PUT /users/profile`: Cập nhật tên hiển thị (`name`).
*   `PUT /users/avatar`: Tải lên và cập nhật ảnh đại diện (hỗ trợ multipart upload qua Cloudinary).
*   `PUT /users/change-password`: Đổi mật khẩu (chặn tài khoản `authProvider === 'google'`).
*   `GET /users/me`: Trả về thông tin đầy đủ của người dùng hiện tại gồm cả `role` và `authProvider`.

### 5.2. Nhóm Đơn Yêu Cầu Tác Giả (`/authors`)
*   `POST /authors/request`: User gửi đơn xin làm tác giả (`penName`, `bio`, `reason`).
*   `GET /authors/my-request`: User kiểm tra trạng thái đơn đăng ký của bản thân.
*   `GET /admin/author-requests`: Admin lấy danh sách toàn bộ các đơn yêu cầu (phân trang, lọc theo `pending`, `approved`, `rejected`).
*   `PUT /admin/author-requests/:id/review`: Admin duyệt hoặc từ chối đơn (`status: 'approved' | 'rejected'`, `adminNote`).

### 5.3. Nhóm Quản Lý Truyện (`/novels`)
*   `PUT /novels/:id`: Cập nhật tiêu đề, cốt truyện (`description`), ảnh bìa.
    *(Middleware: `isLoggedIn`, `checkNovelOwner` - cho phép Author sở hữu hoặc Admin)*.
*   `DELETE /novels/:id`: Xóa truyện hoàn toàn cùng tất cả chương, đánh giá và ảnh liên quan.
    *(Middleware: `isLoggedIn`, `checkNovelOwner` - cho phép Author sở hữu hoặc Admin)*.
*   `GET /admin/novels`: Admin lấy toàn bộ danh sách truyện phục vụ quản trị.

### 5.4. Nhóm Quản Lý Diễn Đàn (`/posts`)
*   `DELETE /posts/:id`: Xóa bài viết diễn đàn.
    *(Middleware: `isLoggedIn`, `checkPostOwner` - cho phép tác giả bài viết hoặc Admin)*.
*   `GET /admin/posts`: Admin lấy danh sách toàn bộ bài viết để giám sát nội dung.

---

## 6. LỘ TRÌNH TRIỂN KHAI (ROADMAP)

Kế hoạch thực hiện được chia làm 5 giai đoạn tuần tự, đảm bảo tính chặt chẽ và không phát sinh lỗi hồi quy:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 1: NÂNG CẤP MODEL & SEED DỮ LIỆU ADMIN                                               │
│  - Cập nhật User model (authProvider, role).                                                  │
│  - Tạo AuthorRequest model.                                                                   │
│  - Viết seeder khởi tạo tự động tài khoản Admin123 / Admin123.                                │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ GIAI ĐOẠN 2: HOÀN THIỆN API BACKEND & MIDDLEWARE RBAC                                          │
│  - Nâng cấp middleware checkNovelOwner, checkPostOwner (hỗ trợ Admin bypass).                 │
│  - Viết API nộp đơn & duyệt đơn tác giả.                                                       │
│  - Viết API cập nhật avatar, sửa tên, đổi mật khẩu (chặn Google Auth).                        │
│  - Viết API thống kê và quản trị dành cho Admin.                                              │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ GIAI ĐOẠN 3: TÁI CẤU TRÚC GIAO DIỆN PROFILE NGƯỜI DÙNG                                         │
│  - Redesign bố cục Profile (Hero Banner, Stat Cards, Tabs).                                   │
│  - Tích hợp nút Camera đổi Avatar, form sửa tên, form đổi mật khẩu.                           │
│  - Tích hợp form đăng ký Tác giả & hiển thị trạng thái chờ duyệt.                              │
│  - Thêm nút Sửa cốt truyện & Xóa truyện trong Tab truyện của tác giả.                          │
│  - Thêm nút Xóa bài viết trong Tab bài viết.                                                  │
│  - Cập nhật khung hiển thị bài viết cá nhân với hình ảnh Auto-fit.                             │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ GIAI ĐOẠN 4: NÂNG CẤP DIỄN ĐÀN, NAVBAR & XÂY DỰNG TRANG ADMIN                                  │
│  - Thiết kế lại bố cục bài viết Diễn đàn: Avatar -> Tên + Ngày -> Nội dung -> Ảnh Auto-fit.    │
│  - Thêm nút "Quản trị viên" trên Navbar giữa "Diễn đàn" và "Hồ sơ" (chỉ hiện với Admin).       │
│  - Xây dựng component AdminRoute bảo vệ đường dẫn.                                            │
│  - Phát triển toàn diện Dashboard Quản trị viên (5 phân hệ quản lý).                          │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│ GIAI ĐOẠN 5: KIỂM THỬ TÍCH HỢP & HOÀN THIỆN BÁO CÁO MẪU THIẾT KẾ                               │
│  - Kiểm thử phân quyền: User thường, Tác giả, Admin.                                          │
│  - Kiểm thử căn chỉnh hình ảnh các tỉ lệ (16:9, 4:3, 9:16, 1:1) trên mọi kích thước màn hình.│
│  - Kiểm thử luồng Google Auth không đổi được mật khẩu.                                        │
│  - Tổng kết sơ đồ UML và tài liệu báo cáo mẫu thiết kế phần mềm.                               │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)

| Mục tiêu nghiệm thu | Kết quả mong đợi |
|:---|:---|
| **Đăng nhập Admin** | Đăng nhập thành công với tài khoản `Admin123` / `Admin123`. |
| **Vị trí nút Quản trị** | Nút "Quản trị viên" hiển thị đúng giữa "Diễn đàn" và "Hồ sơ" khi đăng nhập admin; ẩn hoàn toàn với các role khác. |
| **Bố cục bài viết Diễn đàn** | Phân cấp đúng thứ tự: Avatar người đăng $\rightarrow$ Tên & Ngày giờ $\rightarrow$ Nội dung văn bản $\rightarrow$ Hình ảnh đính kèm. |
| **Căn chỉnh ảnh tự động** | Hình ảnh bài viết (ngang, dọc, vuông) tự động căn chỉnh vừa khít khung hình, không méo hình, không bị cắt xén nội dung quan trọng; đồng bộ trên cả Diễn đàn và Profile. |
| **Sửa/Xóa truyện** | Tác giả sửa được cốt truyện và xóa được truyện của mình; Admin sửa và xóa được bất kỳ truyện nào. User thường không có quyền. |
| **Xóa bài diễn đàn** | Chỉ người đăng bài hoặc Admin mới thấy và thực hiện được thao tác xóa bài. |
| **Duyệt tác giả** | User thường gửi đơn $\rightarrow$ Trạng thái chuyển thành "Chờ duyệt"; Admin bấm duyệt $\rightarrow$ User chuyển thành `author` và có thể đăng truyện. |
| **Đổi mật khẩu** | Tài khoản thường đổi mật khẩu bình thường; Tài khoản Google bị chặn và hiển thị thông báo hướng dẫn rõ ràng. |
| **Đổi Avatar & Tên** | Icon máy ảnh cạnh avatar cho phép chọn ảnh và cập nhật mượt mà; Tên hiển thị cập nhật đồng bộ toàn trang. |
| **Bố cục Profile** | Đạt chuẩn thiết kế hiện đại, responsive đầy đủ trên máy tính và điện thoại di động. |
| **Mẫu thiết kế (Design Patterns)**| Thể hiện rõ ràng các mẫu: Factory Method, Decorator/Middleware, Adapter, Facade, Strategy, State, Observer, Template Method, Singleton trong mã nguồn và báo cáo. |
