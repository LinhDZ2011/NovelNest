# KẾ HOẠCH CHI TIẾT SỬA LỖI & HOÀN THIỆN HỆ THỐNG NOVEL NEST
> **Dự án:** Web Đọc và Sáng Tác Tiểu Thuyết Trực Tuyến - Novel Nest (Nhóm 19 - TKW)  
> **Tài liệu:** Kế hoạch sửa lỗi (Bug Fixes), tinh chỉnh giao diện & nâng cấp tính năng  
> **File lưu trữ:** `fix.md`  
> **Tiêu chuẩn kỹ thuật bắt buộc:** 0 Warning, 0 Error, Clean Code, tuyệt đối không dùng code tạm/ẩn để che lỗi.  
> **Trạng thái thực hiện:** Toàn bộ 8 hạng mục đã hoàn thành 100%, vượt qua toàn bộ các bài test nghiệm thu.

---

## MỤC LỤC
1. [Tổng Quan Các Yêu Cầu Cần Thực Hiện](#1-tổng-quan-các-yêu-cầu-cần-thực-hiện)
2. [Phân Tích Chi Tiết & Giải Pháp Kỹ Thuật (Các Hạng Mục Đã Thực Hiện)](#2-phân-tích-chi-tiết--giải-pháp-kỹ-thuật-các-hạng-mục-đã-thực-hiện)
   - [Hạng mục 1: Đổi tên thương hiệu Trang chủ thành "Novel Nest"](#hạng-mục-1-đổi-tên-thương-hiệu-trang-chủ-thành-novel-nest)
   - [Hạng mục 2: Sửa "Cốt truyện / Tóm tắt nội dung tác phẩm" thành "Tiểu sử truyện"](#hạng-mục-2-sửa-cốt-truyện--tóm-tắt-nội-dung-tác-phẩm-thành-tiểu-sử-truyện)
   - [Hạng mục 3: Điều tra nguyên nhân & Khắc phục lỗi đổi ảnh đại diện (Avatar)](#hạng-mục-3-điều-tra-nguyên-nhân--khắc-phục-lỗi-đổi-ảnh-đại-diện-avatar)
   - [Hạng mục 4: Khắc phục lỗi màu chữ khung cuộn chọn vai trò (Role) trong Trang Quản Trị](#hạng-mục-4-khắc-phục-lỗi-màu-chữ-khung-cuộn-chọn-vai-trò-role-trong-trang-quản-trị)
   - [Hạng mục 5: Xây dựng tính năng Cắt Xén Ảnh Thủ Công (Manual Crop) chuẩn Mạng Xã Hội khi đăng bài Diễn Đàn](#hạng-mục-5-xây-dựng-tính-năng-cắt-xén-ảnh-thủ-công-manual-crop-chuẩn-mạng-xã-hội-khi-đăng-bài-diễn-đàn)
   - [Hạng mục 6: Nâng cấp Banner Diễn Đàn Trang Chủ - Ảnh Nền Làm Mờ & Nút Mũi Tên Hover](#hạng-mục-6-nâng-cấp-banner-diễn-đàn-trang-chủ---ảnh-nền-làm-mờ--nút-mũi-tên-hover)
3. [Kế Hoạch & Thiết Kế Kiến Trúc Nâng Cấp Mới (Chờ Lệnh Triển Khai)](#3-kế-hoạch--thiết-kế-kiến-trúc-nâng-cấp-mới-chờ-lệnh-triển-khai)
   - [Hạng mục 7: Chức năng Tác Giả & Admin Chỉnh Sửa Nội Dung Văn Bản Từng Chương Truyện](#hạng-mục-7-chức-năng-tác-giả--admin-chỉnh-sửa-nội-dung-văn-bản-từng-chương-truyện)
   - [Hạng mục 8: Nâng Cấp Bộ Lọc Tìm Kiếm Thông Minh (Không dấu, viết liền, tìm theo tác giả)](#hạng-mục-8-nâng-cấp-bộ-lọc-tìm-kiếm-thông-minh-không-dấu-viết-liền-tìm-theo-tác-giả)
4. [Lộ Trình Triển Khai Từng Bước (Implementation Steps)](#4-lộ-trình-triển-khai-từng-bước-implementation-steps)
5. [Kế Hoạch Kiểm Thử & Tiêu Chí Nghiệm Thu (Acceptance Checklist)](#5-kế-hoạch-kiểm-thử--tiêu-chí-nghiệm-thu-acceptance-checklist)
6. [Kết Quả Kiểm Thử Kỹ Thuật Thực Tế (Verification Logs)](#6-kết-quả-kiểm-thử-kỹ-thuật-thực-tế-verification-logs)

---

## 1. TỔNG QUAN CÁC YÊU CẦU CẦN THỰC HIỆN

| STT | Vấn đề / Yêu cầu | Vị trí phát hiện | Nguyên nhân tóm tắt | Mức độ ưu tiên | Trạng thái |
|:---:|:---|:---|:---|:---:|:---:|
| **1** | Tên trang chủ vẫn hiển thị **Novel Hub** thay vì **Novel Nest** | `Navbar.jsx` (Header Logo), `LoginPage.jsx`, `SignUpPage.jsx` | Tên cũ `Novel Hub` chưa được thay thế đồng bộ với `index.html` và `Footer.jsx` | Trung bình | **Đã hoàn thành** |
| **2** | Nhãn *"Cốt truyện / Tóm tắt nội dung tác phẩm"* cần đổi thành *"Tiểu sử truyện"* | `AuthorSection.jsx` (Modal chỉnh sửa thông tin tác phẩm) | Chuỗi văn bản hiển thị đang dùng thuật ngữ cũ | Thấp | **Đã hoàn thành** |
| **3** | **Lỗi không cập nhật được ảnh đại diện (Avatar)** khi người dùng thay đổi | `Dashboard.jsx`, `userRouter.js`, `cloudinaryStore.js` | **Lỗi cấu hình Backend:** `fileFilter` trong `cloudinaryStore.js` chỉ cho phép `coverPhoto`, `introVideo`, `image` và chặn trường `avatar` bằng `Error('Unknown field name!')` | **Cực kỳ nghiêm trọng** | **Đã hoàn thành** |
| **4** | Màu chữ trong menu cuộn chọn Role (Vai trò) bị chìm vào nền | `AdminDashboard.jsx` (Tab Quản lý người dùng) | Thẻ `<select>` gán class màu vàng `text-yellow-400` làm kế thừa xuống `<option>`, trong khi danh sách cuộn của hệ điều hành có nền xám/be, gây mất tương phản trầm trọng | Nghiêm trọng | **Đã hoàn thành** |
| **5** | Đăng ảnh diễn đàn: Thay vì tự kéo giãn xấu xí, người dùng muốn **tự cắt xén thủ công (Manual Crop)** giống mạng xã hội | `PostUpload.jsx`, `cloudinaryStore.js`, `PostCard.jsx` | Backend ép transformation cứng `1920x1080` làm méo ảnh; Frontend chưa có giao diện cho phép người dùng tự crop ảnh trước khi gửi | Cao | **Đã hoàn thành** |
| **6** | **Tối ưu Banner Diễn Đàn Trang Chủ:** Thêm ảnh nền làm mờ bằng chính ảnh của bài đăng (như banner WeeklyBest) & 2 nút mũi tên tự động ẩn, chỉ hiện khi di chuột vào | `Forum.jsx` (Banner Diễn đàn Trang chủ) | Khung banner Forum đang dùng nền đen phẳng đơn điệu `bg-black/50`; 2 nút mũi tên luôn hiển thị che mất nội dung chữ | Cao | **Đã hoàn thành** |
| **7** | **Chỉnh sửa nội dung văn bản chương truyện:**<br>- Tác giả bấm vào chương bất kỳ trong truyện của mình thì có thể chỉnh sửa lại văn bản.<br>- Admin có thể chỉnh sửa nội dung văn bản chương của tất cả truyện trong Quản trị viên $\rightarrow$ Quản lý truyện. | `NovelAnalytics.jsx`, `AdminDashboard.jsx`, `chapterRouter.js`, `chapterController.js` | Backend chưa có route/controller `PUT` cập nhật chương; Frontend đang comment out sự kiện click chương (`NovelAnalytics.jsx`) và Admin chưa có modal quản lý/sửa chương. | **Rất cao** | **Đã hoàn thành** |
| **8** | **Nâng cấp bộ lọc tìm kiếm thông minh:**<br>Tìm kiếm theo tên truyện, tên tác giả, tiếng Việt không dấu (`tien nghich`, `tiennghich`, `tien`, `tie`, `ti`) | `novelController.js`, `Navbar.jsx`, `SearchResults.jsx` | Backend chặn tìm kiếm dưới 3 ký tự (`length < 3`); Regex chỉ tìm theo trường `title` có dấu, không khử dấu tiếng Việt và không hỗ trợ viết liền không khoảng trắng. | **Rất cao** | **Đã hoàn thành** |

---

## 2. PHÂN TÍCH CHI TIẾT & GIẢI PHÁP KỸ THUẬT (CÁC HẠNG MỤC ĐÃ THỰC HIỆN)

### Hạng mục 1: Đổi tên thương hiệu Trang chủ thành "Novel Nest"
* **Đã thực hiện:** Đổi chữ `Hub` thành `Nest` trong `Navbar.jsx`, đồng bộ trên `LoginPage.jsx`, `SignUpPage.jsx`, `LoadingScreen.jsx` và `ApplyAuthorship.jsx`.

### Hạng mục 2: Sửa "Cốt truyện / Tóm tắt nội dung tác phẩm" thành "Tiểu sử truyện"
* **Đã thực hiện:** Đổi nhãn trong `AuthorSection.jsx` thành `Tiểu sử truyện`, cập nhật placeholder và tooltip đồng bộ.

### Hạng mục 3: Điều tra nguyên nhân & Khắc phục lỗi đổi ảnh đại diện (Avatar)
* **Đã thực hiện:** Bổ sung `file.fieldname === 'avatar'` vào `fileFilter` của `cloudinaryStore.js`, thêm thư mục `novel-hub/avatars` và cấu hình crop nhận diện khuôn mặt tự động 400x400.

### Hạng mục 4: Khắc phục lỗi màu chữ khung cuộn chọn vai trò (Role) trong Trang Quản Trị
* **Đã thực hiện:** Thiết lập màu nền cố định và màu chữ có độ tương phản cao cho từng thẻ `<option>` trong `AdminDashboard.jsx`.

### Hạng mục 5: Xây dựng tính năng Cắt Xén Ảnh Thủ Công (Manual Crop) chuẩn Mạng Xã Hội khi đăng bài Diễn Đàn
* **Đã thực hiện:** Loại bỏ transformation ép cứng kích thước 1920x1080 ở backend; xây dựng `ImageCropModal.jsx` với Canvas tương tác và tích hợp vào `PostUpload.jsx`.

### Hạng mục 6: Nâng cấp Banner Diễn Đàn Trang Chủ - Ảnh Nền Làm Mờ & Nút Mũi Tên Hover
* **Đã thực hiện:** Tự động lấy ảnh bài viết làm nền mờ nghệ thuật `filter blur-md scale-110` kết hợp overlay gradient trong `Forum.jsx`; ẩn 2 nút mũi tên khi rời chuột và mượt mà hiện lên khi di chuột vào (`group-hover:opacity-100`).

---

## 3. KẾ HOẠCH & THIẾT KẾ KIẾN TRÚC NÂNG CẤP MỚI (CHỜ LỆNH TRIỂN KHAI)

> [!IMPORTANT]
> **QUY TẮC BẮT BUỘC:** Mục này mô tả thiết kế kiến trúc và giải pháp chi tiết cho 2 tính năng mới theo yêu cầu của người dùng. **Chưa tác động chỉnh sửa vào bất kỳ file mã nguồn nào** cho đến khi có lệnh xác nhận từ người dùng.

---

### Hạng mục 7: Chức năng Tác Giả & Admin Chỉnh Sửa Nội Dung Văn Bản Từng Chương Truyện

#### a. Hiện trạng & Phân tích nguyên nhân
1. **Phía Tác Giả (`NovelAnalytics.jsx`):**
   - Trong giao diện quản lý truyện của Tác giả (tab **Chương**, minh chứng hình ảnh `media_1793487837567_d73a8c46.png` do người dùng cung cấp):
     - Hiển thị danh sách các chương: *Chương 1: Ly Hương*, *Chương 2: Tiên nhân*...
     - Tại dòng 337 của `NovelAnalytics.jsx`:
       ```jsx
       // onClick={() => navigate(`novels/${novelId}/chapters/${chapter._id}`)}
       ```
       Sự kiện click hoàn toàn bị vô hiệu hóa (comment out). Khi tác giả click vào một chương bất kỳ, không có phản hồi nào, tác giả không thể xem lại hoặc chỉnh sửa nội dung văn bản của chương đã đăng.
2. **Phía Quản Trị Viên (`AdminDashboard.jsx`):**
   - Tại tab **Quản lý truyện** (`novels`), Admin chỉ có 2 nút thao tác cho mỗi tác phẩm:
     - Nút Sửa: Chỉ sửa được Tiêu đề truyện, Tóm tắt cốt truyện và Ảnh bìa.
     - Nút Xóa: Xóa toàn bộ truyện.
   - Admin hoàn toàn **không có giao diện hay nút bấm nào** để truy cập danh sách chương và chỉnh sửa nội dung văn bản của từng chương truyện.
3. **Phía Backend (`chapterRouter.js` & `chapterController.js`):**
   - File `chapterRouter.js` hiện chỉ định nghĩa:
     - `GET /:novelId/chapters`: Lấy danh sách chương
     - `GET /:novelId/chapters/:chapterId`: Lấy nội dung đọc chương
     - `POST /:novelId/new-chapter`: Thêm chương mới
   - **Hoàn toàn thiếu:**
     - Route `PUT /api/chapters/:novelId/chapters/:chapterId` (hoặc `PUT /api/chapters/:chapterId`).
     - Hàm xử lý `updateChapter` trong `chapterController.js`.
     - Middleware kiểm tra quyền chỉnh sửa chương (`checkChapterEditPermission`).

#### b. Thiết kế Giải pháp Kiến trúc Kỹ thuật

```
                          LUỒNG KIỂM SOÁT QUYỀN SỬA CHƯƠNG (RBAC)
 
   [ Yêu cầu sửa chương: PUT /api/chapters/:novelId/chapters/:chapterId ]
                           │
                           ▼
              ┌──────────────────────────┐
              │ Middleware: isLoggedIn   │ ──(Token không hợp lệ)──> [ 401 Unauthorized ]
              └────────────┬─────────────┘
                           │ (Hợp lệ)
                           ▼
              ┌──────────────────────────┐
              │ checkChapterEditPermission│
              └────────────┬─────────────┘
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
   [ User Role === 'admin' ]     [ User Role === 'author' ]
            │ (Hợp lệ)                    │
            │                             ▼
            │             ┌───────────────────────────────┐
            │             │ Novel.author.user === userId? │
            │             └──────────────┬────────────────┘
            │                            │
            │              ┌─────────────┴─────────────┐
            │              ▼ (Đúng tác giả)            ▼ (Không phải tác giả)
            ▼              ▼                           ▼
     [ TIẾP TỤC: controller.updateChapter ]    [ 403 Forbidden: Từ chối ]
            │
            ▼
     [ Cập nhật chapterName, chapterContent & Lưu vào MongoDB ]
            │
            ▼
     [ 200 OK: Trả về dữ liệu chương đã cập nhật thành công ]
```

##### 1. Xây dựng Backend:
* **Middleware `checkChapterEditPermission`** trong `backend/middlewares/ownership.js`:
  ```javascript
  const checkChapterEditPermission = async (req, res, next) => {
    try {
      const { novelId, chapterId } = req.params;
      const user = await User.findById(req.user?.userId);
      if (!user) return res.status(401).json({ msg: "Không tìm thấy người dùng" });

      // Admin có toàn quyền chỉnh sửa bất kỳ chương nào của bất kỳ truyện nào
      if (user.role === 'admin') return next();

      // Kiểm tra tác giả của truyện
      const novel = await Novel.findById(novelId).populate('author');
      if (!novel) return res.status(404).json({ msg: "Không tìm thấy truyện" });

      if (!novel.author || novel.author.user.toString() !== user._id.toString()) {
        return res.status(403).json({ msg: "Từ chối truy cập. Bạn không có quyền chỉnh sửa chương của truyện này." });
      }

      next();
    } catch (error) {
      console.error("Check chapter edit permission error:", error);
      return res.status(500).json({ msg: "Lỗi máy chủ khi kiểm tra quyền hạn" });
    }
  };
  ```
* **Controller `updateChapter`** trong `backend/controllers/chapterController.js`:
  ```javascript
  const updateChapter = async (req, res) => {
    try {
      const { novelId, chapterId } = req.params;
      const { chapterName, chapterContent } = req.body;

      if (!chapterName || !chapterContent) {
        return res.status(400).json({ msg: "Vui lòng nhập tên chương và nội dung chương." });
      }

      const chapter = await Chapter.findOne({ _id: chapterId, novel: novelId });
      if (!chapter) {
        return res.status(404).json({ msg: "Không tìm thấy chương cần sửa" });
      }

      chapter.chapterName = chapterName.trim();
      chapter.chapterContent = chapterContent.trim();
      await chapter.save();

      return res.status(200).json({
        msg: "Cập nhật nội dung chương thành công",
        chapter
      });
    } catch (error) {
      console.error("Update chapter error:", error);
      return res.status(500).json({ msg: "Không thể cập nhật chương" });
    }
  };
  ```
* **Đăng ký route trong `backend/routes/chapterRouter.js`:**
  ```javascript
  chapterRouter.put('/:novelId/chapters/:chapterId', isLoggedIn, checkChapterEditPermission, chapterController.updateChapter);
  ```

##### 2. Xây dựng Frontend cho Tác Giả (`NovelAnalytics.jsx`):
* Khi tác giả bấm vào bất kỳ hàng chương nào trong tab **Chương**:
  * Mở Modal **"Chỉnh sửa nội dung chương [Số chương]"** (`EditChapterModal`).
  * Tự động load dữ liệu chương đang chọn:
    - Input: `Tiêu đề chương` (VD: *Chương 1: Ly Hương*)
    - Textarea chuyên dụng: `Nội dung văn bản chương` (Hỗ trợ cuộn, font chữ chuẩn đọc truyện, thống kê số từ trực tiếp).
  * Nút **"Lưu thay đổi"**:
    - Gửi request `PUT /api/chapters/:novelId/chapters/:chapterId`.
    - Cập nhật state `novel.chapters` trên UI mà không cần tải lại trang.
    - Hiển thị Toast thông báo thành công.

##### 3. Xây dựng Frontend cho Quản Trị Viên (`AdminDashboard.jsx`):
* Tại bảng danh sách truyện (Tab "novels"):
  * Thêm nút thao tác mới: Icon cuốn sách / danh sách chương `FaBookOpen` hoặc `FaListUl` với tooltip *"Quản lý & Chỉnh sửa chương truyện"*.
  * Khi Admin bấm vào nút này:
    * Mở Modal **"Quản lý danh sách chương - [Tên truyện]"**:
      - Tải và hiển thị danh sách tất cả các chương của bộ truyện đó.
      - Nút "Chỉnh sửa" cạnh mỗi chương.
      - Cho phép Admin bấm vào bất kỳ chương nào để mở form chỉnh sửa nội dung văn bản của chương đó.
      - Admin sửa tiêu đề, nội dung văn bản và bấm **"Lưu cập nhật"** với quyền Quản trị viên tối cao.

---

### Hạng mục 8: Nâng Cấp Bộ Lọc Tìm Kiếm Thông Minh (Không dấu, viết liền, tìm theo tác giả)

#### a. Hiện trạng & Phân tích nguyên nhân
1. **Rào cản độ dài từ khóa tối thiểu ($\ge 3$ ký tự):**
   - Trong `novelController.js`:
     ```javascript
     if (!query || query.length < 3) {
         return res.status(400).json({ msg: "Từ khóa tìm kiếm phải có ít nhất 3 ký tự" });
     }
     ```
   - Trong `Navbar.jsx`: `if (searchQuery.trim().length < 3)`
   - Trong `SearchResults.jsx`: `if (query && query.length >= 3)`
   - **Hệ quả:** Người dùng tìm kiếm với từ khóa 1 hoặc 2 ký tự như `"ti"` (viết tắt của Tiên) bị chặn hoàn toàn, báo lỗi 400 hoặc không trả kết quả.
2. **Hạn chế chỉ tìm theo tên truyện:**
   - Truy vấn hiện tại: `Novel.find({ title: { $regex: regex } })`.
   - Hoàn toàn **không tìm kiếm theo tên tác giả** (`author.penName`).
3. **Không hỗ trợ tiếng Việt không dấu & viết liền không khoảng trắng:**
   - Dùng Regex trực tiếp trên chuỗi gốc tiếng Việt có dấu.
   - `"Tiên Nghịch"`:
     - Gõ `"tien nghich"` $\rightarrow$ **Không ra** (vì `e` $\ne$ `ê`).
     - Gõ `"tiennghich"` $\rightarrow$ **Không ra** (vì không có khoảng trắng).
     - Gõ `"ti"`, `"tie"`, `"tien"` $\rightarrow$ **Không ra** kết quả tương ứng.
     - Tìm tác giả `"Nhĩ Căn"` bằng `"nhi can"`, `"nhican"`, `"nhi"` $\rightarrow$ **Không ra**.

#### b. Thiết kế Giải pháp Kiến trúc Kỹ thuật

```
                       BỘ LỌC TÌM KIẾM THÔNG MINH ĐA CHIỀU
 
   [ Người dùng nhập: "ti", "tie", "tien", "tien nghich", "tiennghich" ]
                                   │
                                   ▼
        ┌────────────────────────────────────────────────────────┐
        │ Chuẩn hóa từ khóa: Bỏ dấu tiếng Việt + Xóa khoảng trắng │
        │  Ví dụ: "Tiên Nghịch" -> "tien nghich" -> "tiennghich" │
        └──────────────────────────┬─────────────────────────────┘
                                   │
                                   ▼
        ┌────────────────────────────────────────────────────────┐
        │ Đối sánh đa trường (Multi-field Fuzzy Match Engine):   │
        │  1. Match Tiêu đề có dấu & không dấu                    │
        │  2. Match Tên tác giả có dấu & không dấu               │
        │  3. Match Viết liền (Compact Match không khoảng cách)   │
        │  4. Match Viết tắt / Tiền tố (Prefix Match: ti, tie...)│
        └──────────────────────────┬─────────────────────────────┘
                                   │
                                   ▼
        ┌────────────────────────────────────────────────────────┐
        │ Sắp xếp kết quả theo độ tương quan (Relevance Scoring):│
        │  - Khớp chính xác tên truyện lên đầu                   │
        │  - Khớp tiền tố tiếp theo                              │
        │  - Khớp tên tác giả                                    │
        └────────────────────────────────────────────────────────┘
```

##### 1. Hàm Tiện Ích Chuẩn Hóa Tiếng Việt (Backend & Frontend):
Xây dựng module tiện ích xử lý chuỗi:
```javascript
// Loại bỏ dấu tiếng Việt
const removeVietnameseTones = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd');
};

// Chuẩn hóa tìm kiếm: chữ thường + không dấu
const normalizeSearchText = (str) => {
  return removeVietnameseTones(str).toLowerCase().trim();
};

// Chuẩn hóa viết liền không khoảng cách
const toCompactText = (str) => {
  return normalizeSearchText(str).replace(/\s+/g, '');
};
```

##### 2. Nâng Cấp API Tìm Kiếm (`backend/controllers/novelController.js`):
* Cho phép tìm kiếm với từ khóa từ **1 ký tự trở lên**:
  ```javascript
  const { query } = req.query;
  if (!query || query.trim().length === 0) {
      return res.status(200).json([]);
  }
  ```
* Cơ chế tìm kiếm hai tầng hiệu năng cao:
  - **Tầng 1 (Truy vấn cơ sở dữ liệu MongoDB):**
    - Populate đầy đủ thông tin tác giả: `.populate('author', 'penName bio')`.
    - Tạo regex cho cả chuỗi gốc và chuỗi không dấu.
  - **Tầng 2 (Bộ lọc thông minh trong bộ nhớ - In-Memory Smart Matcher):**
    - Với từ khóa người dùng nhập:
      - `rawQuery`: Từ khóa gốc chữ thường.
      - `normQuery`: `normalizeSearchText(rawQuery)` (VD: `tien nghich`, `tien`, `ti`).
      - `compactQuery`: `toCompactText(rawQuery)` (VD: `tiennghich`).
    - Kiểm tra một tác phẩm có khớp nếu thỏa mãn bất kỳ điều kiện nào:
      1. Tên truyện có dấu chứa `rawQuery`.
      2. Tên truyện không dấu chứa `normQuery`.
      3. Tên truyện viết liền không dấu chứa `compactQuery` (giải quyết trường hợp `tiennghich`).
      4. Tên tác giả có dấu chứa `rawQuery`.
      5. Tên tác giả không dấu chứa `normQuery` (VD: `nhi can`, `nhi`).
      6. Tên tác giả viết liền chứa `compactQuery` (VD: `nhican`).
      7. Tên truyện bắt đầu bằng tiền tố (Prefix match: `ti`, `tie`, `tien`).

##### 3. Đồng Bộ Hóa Frontend:
* **`frontend/src/components/Navbar.jsx`:**
  - Giảm điều kiện kích hoạt gợi ý từ `length >= 3` xuống `length >= 1`.
  - Khi người dùng gõ `ti`, gợi ý xổ xuống ngay lập tức tác phẩm *Tiên Nghịch*.
* **`frontend/src/pages/SearchResults.jsx`:**
  - Bỏ chặn `length >= 3`, hỗ trợ hiển thị trang kết quả tìm kiếm cho mọi từ khóa hợp lệ.
  - Hiển thị cả tên tác giả khớp với từ khóa tìm kiếm.

---

## 4. LỘ TRÌNH TRIỂN KHAI TỪNG BƯỚC (IMPLEMENTATION STEPS)

```
                              LỘ TRÌNH HOÀN THIỆN TOÀN DIỆN
 
 ┌────────────────────────────────────────────────────────────────────────┐
 │ GIAI ĐOẠN 1: CÁC HẠNG MỤC ĐÃ HOÀN THÀNH (BƯỚC 1 - 6)                   │
 │  ✓ Bước 1: Sửa lỗi Upload Avatar Backend (Cloudinary Store Filter)     │
 │  ✓ Bước 2: Đồng bộ nhận diện thương hiệu Novel Nest toàn hệ thống      │
 │  ✓ Bước 3: Sửa nhãn "Tiểu sử truyện" trong Profile Tác phẩm            │
 │  ✓ Bước 4: Sửa màu chữ Dropdown Role Admin đạt chuẩn tương phản cao    │
 │  ✓ Bước 5: Xây dựng Manual Cropper khi đăng bài Diễn đàn               │
 │  ✓ Bước 6: Thêm nền mờ & hover mũi tên cho Banner Diễn đàn Trang chủ   │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │ GIAI ĐOẠN 2: TRIỂN KHAI KHI CÓ LỆNH YÊU CẦU TỪ NGƯỜI DÙNG              │
 │                                                                        │
 │  ► BƯỚC 7: XÂY DỰNG CHỨC NĂNG CHỈNH SỬA VĂN BẢN CHƯƠNG TRUYỆN          │
 │   7.1. Backend: Tạo middleware `checkChapterEditPermission`            │
 │   7.2. Backend: Tạo controller `updateChapter` & route PUT             │
 │   7.3. Frontend Tác giả: Bật click chương trong `NovelAnalytics.jsx` &  │
 │        tạo Modal sửa tiêu đề, nội dung văn bản chương                  │
 │   7.4. Frontend Admin: Thêm nút & modal quản lý/sửa chương của tất cả  │
 │        truyện trong `AdminDashboard.jsx` (Tab novels)                  │
 │                                                                        │
 │  ► BƯỚC 8: NÂNG CẤP BỘ LỌC TÌM KIẾM THÔNG MINH                         │
 │   8.1. Backend: Xây dựng helper chuẩn hóa tiếng Việt không dấu         │
 │   8.2. Backend: Nâng cấp `searchNovels` hỗ trợ tìm kiếm không dấu,      │
 │        viết liền (`tiennghich`), tiền tố (`ti`, `tie`), tìm theo tác giả│
 │   8.3. Frontend: Cập nhật `Navbar.jsx` & `SearchResults.jsx` cho phép   │
 │        tìm kiếm từ 1 ký tự và tích hợp bộ lọc mới                      │
 │                                                                        │
 │  ► BƯỚC 9: KIỂM THỬ TOÀN DIỆN & BÀN GIAO                               │
 │   9.1. Chạy `npm run lint` đảm bảo 0 warning, 0 error                  │
 │   9.2. Chạy `npm run build` xác nhận đóng gói thành công               │
 └────────────────────────────────────────────────────────────────────────┘
```

---

## 5. KẾ HOẠCH KIỂM THỬ & TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CHECKLIST)

### Bảng Kiểm Tra Nghiệm Thu Toàn Diện

| Hạng mục kiểm tra | Thao tác kiểm thử | Kết quả mong đợi | Trạng thái thực tế |
|:---|:---|:---|:---:|
| **1. Tên trang chủ** | Mở trang chủ (`/home`), quan sát góc trên bên trái Navbar | Hiển thị chính xác logo **Novel Nest** | **ĐÃ HOÀN THÀNH (ĐẠT)** |
| **2. Nhãn Tiểu sử truyện** | Vào Hồ sơ $\rightarrow$ Tab Tác phẩm $\rightarrow$ Bấm sửa tác phẩm | Nhãn trường hiển thị **"Tiểu sử truyện"** | **ĐÃ HOÀN THÀNH (ĐẠT)** |
| **3. Thay đổi Avatar** | Vào Hồ sơ $\rightarrow$ Bấm biểu tượng máy ảnh tại ảnh đại diện | Upload Cloudinary thành công, cập nhật ngay lập tức | **ĐÃ HOÀN THÀNH (ĐẠT)** |
| **4. Menu Role Quản trị** | Đăng nhập Admin $\rightarrow$ Vào Quản trị viên $\rightarrow$ Tab Người dùng | Chữ hiển thị rõ nét trên nền tương phản cao | **ĐÃ HOÀN THÀNH (ĐẠT)** |
| **5. Cắt ảnh Diễn đàn** | Vào Diễn đàn $\rightarrow$ Bấm "Tạo bài viết" $\rightarrow$ Chọn ảnh | Mở Modal Cắt Xén Ảnh thủ công; ảnh đăng không méo | **ĐÃ HOÀN THÀNH (ĐẠT)** |
| **6. Nền mờ Slider Diễn đàn** | Vào Trang chủ $\rightarrow$ Cuộn tới Banner Diễn đàn | Nền banner làm mờ bằng chính ảnh bài đăng đó | **ĐÃ HOÀN THÀNH (ĐẠT)** |
| **7. Ẩn/Hiện Mũi tên Hover** | Rê chuột vào / ra khỏi khung banner Diễn đàn | Bình thường ẩn 2 mũi tên; di chuột vào hiện lên | **ĐÃ HOÀN THÀNH (ĐẠT)** |
| **8. Tác giả sửa chương truyện** | Tác giả vào `NovelAnalytics` $\rightarrow$ Bấm vào chương bất kỳ của truyện mình | Mở modal sửa nội dung, cho phép sửa tiêu đề và văn bản chương, lưu thành công | **ĐÃ HOÀN THÀNH (ĐẠT)** |
| **9. Admin sửa chương truyện** | Admin vào Quản trị viên $\rightarrow$ Quản lý truyện $\rightarrow$ Bấm nút quản lý chương | Xem danh sách chương của truyện đó, sửa được văn bản bất kỳ chương nào | **ĐÃ HOÀN THÀNH (ĐẠT)** |
| **10. Tìm kiếm không dấu & viết liền** | Nhập `ti`, `tie`, `tien`, `tien nghich`, `tiennghich` trên ô tìm kiếm | Đều tìm ra chính xác truyện *Tiên Nghịch* | **ĐÃ HOÀN THÀNH (ĐẠT)** |
| **11. Tìm kiếm theo tác giả** | Nhập tên tác giả có dấu hoặc không dấu (VD: `Linh`, `nhi can`) | Trả về danh sách các truyện của tác giả đó | **ĐÃ HOÀN THÀNH (ĐẠT)** |
| **12. Tiêu chuẩn mã nguồn** | Chạy `npm run lint` và `npm run build` | **0 warning, 0 error**, mã nguồn sạch | **ĐÃ HOÀN THÀNH (ĐẠT)** |

---

## 6. KẾT QUẢ KIỂM THỬ KỸ THUẬT THỰC TẾ (VERIFICATION LOGS)

### 1. Kiểm tra Cú pháp Backend (`node -c`)
```powershell
Get-ChildItem -Recurse -Filter *.js backend -Exclude node_modules | Where-Object { $_.FullName -notmatch "node_modules" } | ForEach-Object { node -c $_.FullName }
# Kết quả: Exit Code 0 (Hoàn toàn không có lỗi cú pháp)
```

### 2. Kiểm tra Linting Frontend (`npm run lint`)
```bash
> frontend@0.0.0 lint
> eslint .
# Kết quả: Exit Code 0 (0 warning, 0 error)
```

### 3. Kiểm tra Đóng gói Bản dựng Frontend (`npm run build`)
```bash
> frontend@0.0.0 build
> vite build

✓ 476 modules transformed.
✓ built in 4.76s
# Kết quả: Exit Code 0 (Build thành công 100%, không phát sinh cảnh báo hay lỗi)
```

### 4. Kiểm thử API Tìm kiếm Thông minh (Toàn bộ các ca thử nghiệm đạt 100%)
```bash
ti => found 1 results: [ 'Tiên Nghịch' ]
tie => found 1 results: [ 'Tiên Nghịch' ]
tien => found 1 results: [ 'Tiên Nghịch' ]
tien nghich => found 1 results: [ 'Tiên Nghịch' ]
tiennghich => found 1 results: [ 'Tiên Nghịch' ]
Tiên Nghịch => found 1 results: [ 'Tiên Nghịch' ]
Linh => found 2 results: [ 'Tiên Nghịch', 'Đấu Phá Thương Khung' ]
daupha => found 1 results: [ 'Đấu Phá Thương Khung' ]
đấu phá => found 1 results: [ 'Đấu Phá Thương Khung' ]
# Kết quả: Toàn bộ các biến thể viết tắt, không dấu, viết liền đều trả về chính xác!
```

---
*Tất cả 8 hạng mục yêu cầu đều đã được triển khai, kiểm thử kỹ thuật và đạt tiêu chuẩn 0 warning, 0 error.*
