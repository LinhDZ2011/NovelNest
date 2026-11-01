import { useState, useRef, useEffect, useCallback } from "react";
import {
  FaTimes,
  FaCheck,
  FaRedo,
  FaCropAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";

const ASPECT_RATIOS = [
  { label: "Tự do", value: null },
  { label: "16:9", value: 16 / 9 },
  { label: "4:3", value: 4 / 3 },
  { label: "1:1", value: 1 },
  { label: "9:16", value: 9 / 16 },
];

const ImageCropModal = ({ file, isOpen, onClose, onCropComplete, isDarkMode }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [aspectRatio, setAspectRatio] = useState(null); // null = tự do

  // Kích thước hiển thị thực tế của ảnh trong container
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });

  // Khung crop: tính theo pixel hiển thị bên trong container ảnh
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const dragRef = useRef({
    isDragging: false,
    isResizing: false,
    handle: null,
    startX: 0,
    startY: 0,
    startCrop: { x: 0, y: 0, width: 0, height: 0 },
  });

  // Đọc file thành data URL khi file thay đổi
  useEffect(() => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target.result);
      setAspectRatio(null);
    };
    reader.readAsDataURL(file);
  }, [file]);

  // Cập nhật khung crop mặc định khi ảnh được load
  const initCropBox = useCallback((imgWidth, imgHeight, ratio = null) => {
    let w = imgWidth * 0.85;
    let h = imgHeight * 0.85;

    if (ratio) {
      if (w / h > ratio) {
        w = h * ratio;
      } else {
        h = w / ratio;
      }
    }

    const x = Math.max(0, (imgWidth - w) / 2);
    const y = Math.max(0, (imgHeight - h) / 2);

    setCrop({
      x: Math.round(x),
      y: Math.round(y),
      width: Math.round(w),
      height: Math.round(h),
    });
  }, []);

  const handleImageLoaded = () => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    setDisplaySize({ width: w, height: h });
    initCropBox(w, h, aspectRatio);
  };

  // Khi thay đổi tỉ lệ (aspect ratio)
  const handleSelectRatio = (ratio) => {
    setAspectRatio(ratio);
    if (displaySize.width > 0 && displaySize.height > 0) {
      initCropBox(displaySize.width, displaySize.height, ratio);
    }
  };

  // --- XỬ LÝ KÉO DI CHUYỂN KHUNG CROP ---
  const handlePointerDownDrag = (e) => {
    e.stopPropagation();
    e.preventDefault();
    dragRef.current = {
      isDragging: true,
      isResizing: false,
      handle: null,
      startX: e.clientX,
      startY: e.clientY,
      startCrop: { ...crop },
    };
  };

  // --- XỬ LÝ RESIZE KHUNG CROP THEO TAY NẮM (HANDLES) ---
  const handlePointerDownResize = (e, handle) => {
    e.stopPropagation();
    e.preventDefault();
    dragRef.current = {
      isDragging: false,
      isResizing: true,
      handle: handle,
      startX: e.clientX,
      startY: e.clientY,
      startCrop: { ...crop },
    };
  };

  // --- XỬ LÝ DI CHUYỂN CHUỘT / TOUCH ---
  useEffect(() => {
    const handlePointerMove = (e) => {
      const state = dragRef.current;
      if (!state.isDragging && !state.isResizing) return;

      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;
      const { startCrop } = state;
      const { width: maxW, height: maxH } = displaySize;

      if (state.isDragging) {
        let newX = startCrop.x + dx;
        let newY = startCrop.y + dy;

        // Giới hạn trong biên ảnh
        newX = Math.max(0, Math.min(newX, maxW - startCrop.width));
        newY = Math.max(0, Math.min(newY, maxH - startCrop.height));

        setCrop((prev) => ({
          ...prev,
          x: Math.round(newX),
          y: Math.round(newY),
        }));
      } else if (state.isResizing) {
        let { x, y, width, height } = startCrop;
        const h = state.handle;

        if (h.includes("e")) width += dx;
        if (h.includes("s")) height += dy;
        if (h.includes("w")) {
          width -= dx;
          x += dx;
        }
        if (h.includes("n")) {
          height -= dy;
          y += dy;
        }

        // Áp dụng tỉ lệ khóa nếu có
        if (aspectRatio) {
          if (h.includes("e") || h.includes("w")) {
            height = width / aspectRatio;
          } else {
            width = height * aspectRatio;
          }
        }

        // Kích thước tối thiểu
        const minSize = 40;
        if (width < minSize) width = minSize;
        if (height < minSize) height = minSize;

        // Giới hạn biên
        if (x < 0) {
          width += x;
          x = 0;
        }
        if (y < 0) {
          height += y;
          y = 0;
        }
        if (x + width > maxW) width = maxW - x;
        if (y + height > maxH) height = maxH - y;

        setCrop({
          x: Math.round(x),
          y: Math.round(y),
          width: Math.round(width),
          height: Math.round(height),
        });
      }
    };

    const handlePointerUp = () => {
      dragRef.current.isDragging = false;
      dragRef.current.isResizing = false;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [displaySize, aspectRatio]);

  // --- XUẤT ẢNH ĐÃ CẮT THÔNG QUA CANVAS ---
  const handleApplyCrop = () => {
    if (!imgRef.current) return;
    const img = imgRef.current;

    // Tỉ lệ scale giữa ảnh gốc và ảnh hiển thị
    const scaleX = img.naturalWidth / displaySize.width;
    const scaleY = img.naturalHeight / displaySize.height;

    const sourceX = crop.x * scaleX;
    const sourceY = crop.y * scaleY;
    const sourceWidth = crop.width * scaleX;
    const sourceHeight = crop.height * scaleY;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(sourceWidth);
    canvas.height = Math.round(sourceHeight);
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Vẽ ảnh đã crop lên Canvas
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Chuyển Canvas thành Blob/File
    const fileType = file.type || "image/jpeg";
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const croppedFile = new File([blob], file.name, {
          type: fileType,
          lastModified: Date.now(),
        });
        const croppedUrl = URL.createObjectURL(blob);
        onCropComplete(croppedFile, croppedUrl);
        onClose();
      },
      fileType,
      0.95
    );
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`w-full max-w-4xl max-h-[95vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border ${
          isDarkMode
            ? "bg-gray-900 border-gray-800 text-white"
            : "bg-white border-gray-200 text-gray-900"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <FaCropAlt className="text-blue-500 text-lg" />
            <h3 className="font-bold text-lg">Cắt xén ảnh thủ công</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Toolbar: Aspect Ratio Presets & Controls */}
        <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-800/40">
          {/* Preset Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-400 mr-1">
              Tỉ lệ khung:
            </span>
            {ASPECT_RATIOS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleSelectRatio(item.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  aspectRatio === item.value
                    ? "bg-blue-600 text-white shadow-sm"
                    : isDarkMode
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Quick Tools */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (displaySize.width && displaySize.height) {
                  initCropBox(displaySize.width, displaySize.height, aspectRatio);
                }
              }}
              title="Đặt lại khung cắt"
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-1.5 transition-colors"
            >
              <FaRedo className="text-[10px]" /> Đặt lại
            </button>
          </div>
        </div>

        {/* Workspace Canvas / Image Cropping Stage */}
        <div
          ref={containerRef}
          className="relative flex-1 min-h-[320px] max-h-[55vh] bg-black/95 flex items-center justify-center p-4 select-none overflow-hidden"
        >
          <div className="relative inline-block max-w-full max-h-full">
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Source to crop"
              onLoad={handleImageLoaded}
              className="max-w-full max-h-[50vh] object-contain block mx-auto pointer-events-none select-none rounded-lg"
            />

            {/* OVERLAY & CROP BOX */}
            {displaySize.width > 0 && crop.width > 0 && (
              <>
                {/* Lớp phủ tối 4 phía bên ngoài khung crop */}
                <div
                  className="absolute left-0 top-0 w-full bg-black/60 pointer-events-none"
                  style={{ height: `${crop.y}px` }}
                />
                <div
                  className="absolute left-0 bg-black/60 pointer-events-none"
                  style={{
                    top: `${crop.y + crop.height}px`,
                    bottom: 0,
                    width: "100%",
                  }}
                />
                <div
                  className="absolute left-0 bg-black/60 pointer-events-none"
                  style={{
                    top: `${crop.y}px`,
                    height: `${crop.height}px`,
                    width: `${crop.x}px`,
                  }}
                />
                <div
                  className="absolute right-0 bg-black/60 pointer-events-none"
                  style={{
                    top: `${crop.y}px`,
                    height: `${crop.height}px`,
                    left: `${crop.x + crop.width}px`,
                  }}
                />

                {/* KHUNG CẮT XÉN CHÍNH (CROP BOX) */}
                <div
                  onPointerDown={handlePointerDownDrag}
                  className="absolute border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.5)] cursor-move"
                  style={{
                    left: `${crop.x}px`,
                    top: `${crop.y}px`,
                    width: `${crop.width}px`,
                    height: `${crop.height}px`,
                  }}
                >
                  {/* Lưới Quy tắc 1/3 (Rule of Thirds Grid) */}
                  <div className="w-full h-full pointer-events-none grid grid-cols-3 grid-rows-3">
                    <div className="border-r border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div className="border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div className="border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div className="border-r border-b border-white/30" />
                    <div />
                  </div>

                  {/* 4 TAY NẮM GÓC ĐỂ CO KÉO (CORNER HANDLES) */}
                  {/* Góc Tây Bắc (Top-Left) */}
                  <div
                    onPointerDown={(e) => handlePointerDownResize(e, "nw")}
                    className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-blue-600 rounded-sm cursor-nwse-resize shadow-md"
                  />
                  {/* Góc Đông Bắc (Top-Right) */}
                  <div
                    onPointerDown={(e) => handlePointerDownResize(e, "ne")}
                    className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-blue-600 rounded-sm cursor-nesw-resize shadow-md"
                  />
                  {/* Góc Tây Nam (Bottom-Left) */}
                  <div
                    onPointerDown={(e) => handlePointerDownResize(e, "sw")}
                    className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-blue-600 rounded-sm cursor-nesw-resize shadow-md"
                  />
                  {/* Góc Đông Nam (Bottom-Right) */}
                  <div
                    onPointerDown={(e) => handlePointerDownResize(e, "se")}
                    className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-blue-600 rounded-sm cursor-nwse-resize shadow-md"
                  />

                  {/* 4 TAY NẮM CẠNH (EDGE HANDLES) */}
                  <div
                    onPointerDown={(e) => handlePointerDownResize(e, "n")}
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-2 bg-white/80 rounded-full cursor-ns-resize shadow"
                  />
                  <div
                    onPointerDown={(e) => handlePointerDownResize(e, "s")}
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-2 bg-white/80 rounded-full cursor-ns-resize shadow"
                  />
                  <div
                    onPointerDown={(e) => handlePointerDownResize(e, "w")}
                    className="absolute top-1/2 -translate-y-1/2 -left-1.5 h-6 w-2 bg-white/80 rounded-full cursor-ew-resize shadow"
                  />
                  <div
                    onPointerDown={(e) => handlePointerDownResize(e, "e")}
                    className="absolute top-1/2 -translate-y-1/2 -right-1.5 h-6 w-2 bg-white/80 rounded-full cursor-ew-resize shadow"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
          <p className="text-xs text-gray-500 hidden sm:block">
            Kéo khung hoặc các góc để cắt xén ảnh theo ý muốn.
          </p>
          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleApplyCrop}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-lg hover:shadow-blue-500/25 flex items-center gap-2 transition-all active:scale-95"
            >
              <FaCheck /> Xác nhận cắt ảnh
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ImageCropModal;
