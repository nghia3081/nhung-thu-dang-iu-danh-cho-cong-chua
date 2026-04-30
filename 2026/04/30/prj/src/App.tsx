/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue, useReducedMotion } from "motion/react";
import { toCanvas } from "html-to-image";
import {
  Heart,
  Music,
  Calendar,
  MapPin,
  Clock,
  ChevronDown,
  Sparkles,
  Camera,
  Star,
  Mail,
  MessageCircle,
  Send,
  Bookmark,
  Lock,
  Zap,
  Moon,
  Download,
  X,
  ArrowLeft,
  ArrowRight,
  RefreshCw
} from "lucide-react";

// --- Types ---
interface MousePosition {
  x: number;
  y: number;
}

const PHOTO_FRAMES = [
  { id: 'classic', label: 'Cổ điển', color: '#ffffff' },
  { id: 'polaroid', label: 'Polaroid', color: '#f8f8f8' },
  { id: 'instagram', label: 'Instagram', color: '#ffffff' },
  { id: 'minimal', label: 'Tối giản', color: 'transparent' }
];

const FRAME_TEMPLATE_VERSION = "v3-instagram-no-caption";
const CAPTURE_MIN_LONG_EDGE = 4096;
const DESKTOP_IMAGE_MAP = import.meta.glob("./assets/images/*", {
  eager: true,
  import: "default"
}) as Record<string, string>;

const getImageUrlByName = (fileName: string) => {
  const desktopKey = `./assets/images/${fileName}`;
  const desktopSrc = DESKTOP_IMAGE_MAP[desktopKey];
  return desktopSrc;
};

const getAllImageUrls = () => {
  return Object.values(DESKTOP_IMAGE_MAP);
};

const TIMELINE_IMAGE_FILE_GROUPS = {
  firstMeet: ["moc 1.jpeg"],
  firstDate: [
    "moc 2 1.jpeg",
    "moc 2 2.jpeg"
  ],
  nextDates: [
    "moc 3 1.jpeg",
    "moc 3 2.jpeg",
    "moc 3 3.jpeg",
    "moc 3 4.jpeg",
    "moc 3 5.jpeg"
  ],
  gifts: [
    "moc 4 1.jpeg",
    "moc 4 2.jpeg",
    "moc 4 3.jpeg",
    "moc 4 4.JPG",
    "moc 4 5.JPG",
    "moc 4 5.jpeg"
  ],
  trips: [
    "moc 5 1.jpeg",
    "moc 5 2.jpeg",
    "moc 5 3.jpeg",
    "moc 5 4.jpeg",
    "moc 5 5.jpeg"
  ],
  finally: [
    "moc 6 1.jpeg",
    "moc 6 2.jpeg",
    "moc 6 3.jpeg",
    "moc 6 4.JPG",
    "moc 6 5.jpeg",
    "moc 6 6.jpeg",
    "moc 6 7.jpeg",
    "moc 6 8.jpeg",
    "moc 6 9.jpeg"
  ],
  lastMilestone: ["moc 7.jpeg"]
} as const;

// --- Components ---

const MouseParticles = () => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const lastTimestampRef = useRef<number>(0);
  const intraMsSequenceRef = useRef<number>(0);
  const rafLockRef = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (rafLockRef.current) return;
      rafLockRef.current = true;
      requestAnimationFrame(() => {
        rafLockRef.current = false;
      });
      if (Math.random() > 0.85) {
        const now = Date.now();
        if (now === lastTimestampRef.current) {
          intraMsSequenceRef.current += 1;
        } else {
          lastTimestampRef.current = now;
          intraMsSequenceRef.current = 0;
        }
        const id = now * 1000 + intraMsSequenceRef.current;
        setParticles((prev) => [...prev.slice(-12), { id, x: e.clientX, y: e.clientY }]);
        setTimeout(() => {
          setParticles((prev) => prev.filter((p) => p.id !== id));
        }, 550);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[60]">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, scale: 0, x: p.x, y: p.y, rotate: 0 }}
            animate={{
              opacity: [1, 1, 0],
              scale: [0, 1.2, 0.5],
              y: p.y - (Math.random() * 100),
              x: p.x + (Math.random() * 60 - 30),
              rotate: 180
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute"
          >
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const Petal = ({ delay = 0, x = 0 }: { delay?: number; x?: number; key?: any }) => (
  <motion.div
    initial={{ y: -100, rotate: 0, opacity: 0 }}
    animate={{
      y: ["0vh", "110vh"],
      x: [0, Math.random() * 100 - 50],
      rotate: [0, 180, 360],
      opacity: [0, 0.8, 0.8, 0]
    }}
    transition={{
      duration: 12 + Math.random() * 18,
      repeat: Infinity,
      delay,
      ease: "linear"
    }}
    style={{ left: `${x}%` }}
    className="fixed pointer-events-none z-10"
  >
    <div
      className="w-5 h-5 bg-pink-200/70 rounded-full blur-[0.5px] border border-white/30 shadow-[0_0_10px_rgba(251,207,232,0.5)]"
      style={{ borderRadius: '60% 40% 70% 30% / 50% 50% 50% 50%' }}
    />
  </motion.div>
);

const PetalOverlay = () => {
  const petals = useMemo(() => Array.from({ length: 7 }), []);
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-10">
      {petals.map((_, i) => (
        <Petal key={i} delay={i * 3} x={Math.random() * 100} />
      ))}
    </div>
  );
};

const SecretNote = ({
  children,
  x,
  y,
  isAnimated = true
}: {
  children: React.ReactNode;
  x: string;
  y: string;
  isAnimated?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const xValue = parseInt(x);
  const yValue = parseInt(y);

  // Decide alignment based on X position to prevent overflow
  const getAlignment = () => {
    if (xValue < 30) return "left-0 translate-x-0";
    if (xValue > 70) return "right-0 translate-x-0";
    return "left-1/2 -translate-x-1/2";
  };

  const getArrowXPos = () => {
    if (xValue < 30) return "left-4 translate-x-0";
    if (xValue > 70) return "right-4 translate-x-0";
    return "left-1/2 -translate-x-1/2";
  };

  // Adaptive vertical alignment
  const isNearBottom = yValue > 75;
  const verticalClass = isNearBottom ? "bottom-14" : "top-14";
  const arrowVerticalClass = isNearBottom
    ? "-bottom-2 border-b border-r border-t-0 border-l-0"
    : "-top-2 border-t border-l border-b-0 border-r-0";

  const randomDuration = useMemo(() => 5 + Math.random() * 5, []);
  const randomDelay = useMemo(() => Math.random() * -10, []);

  return (
    <motion.div
      className={`absolute pointer-events-auto transition-all duration-300 ${isOpen ? 'z-[100]' : 'z-20'}`}
      style={{ left: x, top: y }}
      animate={isAnimated ? {
        y: [0, -10, 0],
        x: [0, 6, 0],
      } : undefined}
      transition={isAnimated ? {
        duration: randomDuration,
        repeat: Infinity,
        delay: randomDelay,
        ease: "easeInOut"
      } : undefined}
    >
      <motion.button
        whileHover={{ scale: 1.2, rotate: 15 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full glass flex items-center justify-center text-pink-300 hover:text-pink-500 transition-colors shadow-sm"
      >
        <Sparkles className="w-4 h-4 animate-pulse" />
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: isNearBottom ? 10 : -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: isNearBottom ? 10 : -10 }}
            className={`absolute ${verticalClass} ${getAlignment()} w-64 md:w-80 p-6 glass rounded-[2rem] border-pink-100/50 shadow-2xl z-50 text-center pointer-events-auto`}
          >
            <div className={`absolute ${arrowVerticalClass} ${getArrowXPos()} w-4 h-4 glass rotate-45 -z-10`} />
            <p className="text-sm md:text-base font-serif italic text-zinc-600 leading-relaxed">
              "{children}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const SecretCard = ({
  frontImage,
  backImage,
  position,
  index,
  total,
  onSwipe,
  isLowPerfMode = false
}: {
  frontImage: string;
  backImage: string;
  position: 'left' | 'center' | 'right';
  index: number;
  total: number;
  onSwipe: (direction: number) => void;
  isLowPerfMode?: boolean;
  key?: React.Key;
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const x = useMotionValue(0);
  const backFaceRef = useRef<HTMLDivElement>(null);

  const handleCardToggle = () => {
    setIsFlipped(!isFlipped);
  };

  // Calculate relative offsets for stacking
  const rotateOffset = (total - 1 - index) * 3;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const stackBaseX = isMobile ? 240 : 380;

  const targetX = position === 'center' ? 0 : (position === 'left' ? -stackBaseX : stackBaseX);
  const targetRotate = position === 'center' ? 0 : (position === 'left' ? -15 - rotateOffset : 15 + rotateOffset);
  const targetScale = position === 'center' ? 1 : 0.8;
  const targetZ = position === 'center' ? 50 - index : index;

  const handleDragEnd = (_: any, info: any) => {
    const threshold = 100;
    if (position === 'center') {
      if (info.offset.x > threshold) onSwipe(1); // To right
      else if (info.offset.x < -threshold) onSwipe(-1); // To left
    } else {
      // Swiping back to center
      if (position === 'left' && info.offset.x > threshold) onSwipe(0);
      else if (position === 'right' && info.offset.x < -threshold) onSwipe(0);
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={isLowPerfMode ? 0.22 : 0.6}
      onDragEnd={handleDragEnd}
      animate={{
        x: targetX,
        rotate: targetRotate,
        scale: targetScale,
        zIndex: targetZ
      }}
      transition={{
        type: "spring",
        stiffness: isLowPerfMode ? 180 : 260,
        damping: isLowPerfMode ? 36 : 30,
        zIndex: { delay: position === 'center' ? 0 : 0.1 }
      }}
      className={`absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing transition-shadow duration-500`}
      style={{ perspective: "2000px", x }}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ transformStyle: "preserve-3d", WebkitTransformStyle: "preserve-3d" }}
        className="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl"
        onClick={handleCardToggle}
      >
        {/* Front */}
        <div
          className="absolute inset-0 w-full h-full rounded-[2.5rem] overflow-hidden bg-zinc-100"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
        >
          <img
            src={frontImage}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover transition-all duration-700 ${position !== 'center' ? 'grayscale opacity-50 blur-[2px]' : 'grayscale-0 opacity-100'}`}
            referrerPolicy="no-referrer"
          />
          <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white transition-opacity duration-300 ${position !== 'center' ? 'opacity-0' : 'opacity-100'}`}>
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-70">Memories #{index + 1}</span>
              <p className="text-xl font-serif italic">Chạm để xem • Vuốt để xếp</p>
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          ref={backFaceRef}
          className="absolute inset-0 w-full h-full rounded-[2.5rem] overflow-hidden bg-white"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg) translateZ(1px)" }}
        >
          <img src={backImage} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover opacity-80 blur-md scale-110" />
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 z-10 bg-black/15" />
        </div>
      </motion.div>
    </motion.div>
  );
};

const SecretStack = ({ imagePool }: { imagePool: readonly string[] }) => {
  const shouldReduceMotion = useReducedMotion();
  const isMobileViewport = typeof window !== "undefined" ? window.innerWidth < 768 : false;
  const isLowPerfMode = shouldReduceMotion || isMobileViewport;
  const notes = useMemo(
    () => [
      "Mọi khoảnh khắc bên em đều là báu vật vô giá mà anh luôn trân trọng.",
      "Nhớ ngày mình cùng đi dưới mưa, em đã nắm tay anh thật chặt.",
      "Nụ cười của em là điều ngọt ngào nhất mà anh từng biết.",
      "Cùng anh đi qua những ngày giông bão, để thấy nắng ấm vẫn luôn ở đây.",
      "Mỗi lần em nhìn anh, tim anh lại rung lên như lần đầu.",
      "Dù ngày dài hay ngắn, chỉ cần có em là đủ đầy.",
      "Anh thích tất cả những điều giản dị khi ở bên em.",
      "Mình cứ nắm tay nhau đi qua từng ngày thật bình yên.",
      "Chỉ cần em ở đây, mọi thứ đều trở nên đẹp hơn.",
      "Anh mong mỗi bức ảnh đều giữ lại một lần tim mình lỡ nhịp."
    ],
    []
  );

  const initialCards = useMemo(() => {
    if (imagePool.length === 0) {
      return [];
    }
    const shuffled = [...imagePool].sort(() => Math.random() - 0.5);
    return notes.map((note, index) => ({
      id: index + 1,
      front: shuffled[(index * 2) % shuffled.length] ?? imagePool[0],
      back: shuffled[(index * 2 + 1) % shuffled.length] ?? imagePool[0],
      note,
      pos: 'center' as 'left' | 'center' | 'right'
    }));
  }, [imagePool, notes]);

  const [cards, setCards] = useState(initialCards);

  const handleSwipe = (cardId: number, direction: number) => {
    setCards(prev => prev.map(card => {
      if (card.id === cardId) {
        let newPos: 'left' | 'center' | 'right' = 'center';
        if (direction === 1) newPos = 'right';
        else if (direction === -1) newPos = 'left';
        return { ...card, pos: newPos };
      }
      return card;
    }));
  };

  const centerCards = cards.filter(c => c.pos === 'center');
  const isFinished = centerCards.length === 0;
  const maxRenderedCards = isLowPerfMode ? 6 : 8;
  const renderedCards = useMemo(() => {
    const nonCenterCards = cards.filter((c) => c.pos !== "center");
    const centerLimit = isLowPerfMode ? 2 : 4;
    const limitedCenterCards = cards.filter((c) => c.pos === "center").slice(0, centerLimit);
    return [...nonCenterCards, ...limitedCenterCards].slice(0, maxRenderedCards);
  }, [cards, isLowPerfMode, maxRenderedCards]);

  return (
    <div className="relative w-full aspect-[4/5] max-w-sm mx-auto flex items-center justify-center">
      <AnimatePresence>
        {isFinished && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center p-8 text-center rounded-[2.5rem]"
          >
            <div className="space-y-6">
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Heart className="w-16 h-16 text-pink-400 fill-pink-400/20 mx-auto" />
              </motion.div>
              <h3 className="text-4xl md:text-5xl font-serif text-zinc-800 leading-tight">
                Em là mảnh ghép <br />
                <span className="text-romantic-gold italic font-light">duy nhất còn thiếu</span>
              </h3>
              <p className="text-zinc-500 font-serif italic text-lg leading-relaxed">
                Khi tất cả kỷ niệm được xếp lại, <br />
                chỉ còn anh và tình yêu dành cho em.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCards(prev => prev.map(c => ({ ...c, pos: 'center' })))}
                className="pointer-events-auto px-8 py-3 bg-pink-50 text-pink-600 rounded-full font-sans font-bold text-xs uppercase tracking-widest border border-pink-100 hover:bg-pink-100 transition-colors"
              >
                Xem lại kỷ niệm
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative w-full h-full">
        {renderedCards.map((card) => {
          const cardIndex = cards.findIndex((c) => c.id === card.id);
          return (
          <SecretCard
            key={card.id}
            index={cardIndex}
            total={cards.length}
            frontImage={card.front}
            backImage={card.back}
            position={card.pos}
            onSwipe={(dir) => handleSwipe(card.id, dir)}
            isLowPerfMode={isLowPerfMode}
          />
          );
        })}
      </div>
    </div>
  );
};

const RomanticCamera = ({ autoStart = false }: { autoStart?: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captureAreaRef = useRef<HTMLDivElement>(null);
  const frameOverlayRef = useRef<HTMLDivElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [captures, setCaptures] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isCameraInView, setIsCameraInView] = useState(false);
  const [isCameraRequested, setIsCameraRequested] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(typeof document === "undefined" ? true : document.visibilityState === "visible");
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);

  // Camera selection state
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");

  const [isStackDragging, setIsStackDragging] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState('classic');
  const [customText, setCustomText] = useState('Hiệp yêu Trang rất nhiều');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isFrameCacheReady] = useState(true);
  const [isPrewarmingFrames, setIsPrewarmingFrames] = useState(false);
  const overlayCacheRef = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const isPrewarmInFlightRef = useRef(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const shouldRunCameraRef = useRef(false);
  const shouldRunCamera = isCameraRequested && isPageVisible;

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setStream(null);
    setIsActive(false);
    setIsInitializing(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const navigatePhoto = (direction: 'next' | 'prev') => {
    if (!enlargedPhoto || captures.length <= 1) return;
    const currentIndex = captures.indexOf(enlargedPhoto);
    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % captures.length;
    } else {
      nextIndex = (currentIndex - 1 + captures.length) % captures.length;
    }
    setEnlargedPhoto(captures[nextIndex]);
  };

  const getDevices = async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      if (videoDevices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error("Error enumerating devices:", err);
    }
  };

  const maximizeTrackResolution = async (mediaStream: MediaStream) => {
    const track = mediaStream.getVideoTracks()[0];
    if (!track) return;
    const capabilities = track.getCapabilities?.();
    if (!capabilities?.width?.max || !capabilities?.height?.max) return;
    try {
      await track.applyConstraints({
        width: { ideal: capabilities.width.max },
        height: { ideal: capabilities.height.max }
      });
    } catch {
      // Keep stream defaults if max constraints are unsupported.
    }
  };

  const startCamera = useCallback(async (deviceId?: string) => {
    if (!shouldRunCameraRef.current || isInitializing) return;
    const currentDeviceId = streamRef.current?.getVideoTracks()[0]?.getSettings().deviceId;
    if (streamRef.current && isActive && (!deviceId || deviceId === currentDeviceId)) {
      return;
    }
    setIsInitializing(true);

    // Stop old stream if exists
    stopCamera();

    try {
      const constraints = {
        video: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          width: { ideal: 3840, min: 1280 },
          height: { ideal: 2160, min: 720 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      if (!shouldRunCameraRef.current) {
        mediaStream.getTracks().forEach(track => track.stop());
        return;
      }
      await maximizeTrackResolution(mediaStream);
      streamRef.current = mediaStream;
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => {});
      }
      setIsActive(true);

      // Update device list after permission is granted (to get labels)
      getDevices();
    } catch (err) {
      console.error("Camera access denied", err);
    } finally {
      setIsInitializing(false);
    }
  }, [isActive, isInitializing, stopCamera]);

  useEffect(() => {
    shouldRunCameraRef.current = shouldRunCamera;
  }, [shouldRunCamera]);

  useEffect(() => {
    if (!stream || !videoRef.current) return;
    if (videoRef.current.srcObject !== stream) {
      videoRef.current.srcObject = stream;
    }
    videoRef.current.play().catch(() => {});
  }, [stream]);

  useEffect(() => {
    const captureArea = captureAreaRef.current;
    if (!captureArea || typeof IntersectionObserver === "undefined") {
      setIsCameraInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCameraInView(entry.isIntersecting && entry.intersectionRatio >= 0.15);
      },
      { threshold: [0, 0.1, 0.15, 0.25, 0.5, 0.75] }
    );
    observer.observe(captureArea);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (shouldRunCamera) {
      startCamera(selectedDeviceId || undefined);
    } else {
      stopCamera();
    }
  }, [selectedDeviceId, shouldRunCamera, startCamera, stopCamera, isCameraRequested, isCameraInView, isPageVisible, isActive]);

  useEffect(() => () => {
    stopCamera();
  }, [stopCamera]);

  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value;
    setSelectedDeviceId(newId);
    if (shouldRunCameraRef.current) {
      startCamera(newId);
    }
  };

  const handleStartCamera = () => {
    setIsCameraRequested(true);
  };

  useEffect(() => {
    if (autoStart) {
      setIsCameraRequested(true);
    }
  }, [autoStart]);

  const drawHeart = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    isFilled: boolean,
    color: string
  ) => {
    ctx.save();
    ctx.beginPath();
    ctx.translate(x, y);
    ctx.moveTo(0, size * 0.25);
    ctx.bezierCurveTo(0, size * 0.25, -size * 0.05, 0, -size * 0.25, 0);
    ctx.bezierCurveTo(-size * 0.5, 0, -size * 0.5, size * 0.4, -size * 0.5, size * 0.4);
    ctx.bezierCurveTo(-size * 0.5, size * 0.6, -size * 0.25, size * 0.8, 0, size);
    ctx.bezierCurveTo(size * 0.25, size * 0.8, size * 0.5, size * 0.6, size * 0.5, size * 0.4);
    ctx.bezierCurveTo(size * 0.5, size * 0.4, size * 0.5, 0, size * 0.25, 0);
    ctx.bezierCurveTo(size * 0.1, 0, 0, size * 0.25, 0, size * 0.25);
    if (isFilled) {
      ctx.fillStyle = color;
      ctx.fill();
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1.5, size * 0.12);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.stroke();
    }
    ctx.restore();
  };

  const drawSelectedFrame = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const dateStr = new Date().toLocaleDateString("vi-VN");
    const displayText = customText || "";
    switch (selectedFrame) {
      case "classic": {
        const topSide = width * 0.05;
        const bottom = height * 0.125;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width, topSide);
        ctx.fillRect(0, 0, topSide, height);
        ctx.fillRect(width - topSide, 0, topSide, height);
        ctx.fillRect(0, height - bottom, width, bottom);
        ctx.fillStyle = "#71717a";
        ctx.font = `italic 400 ${bottom * 0.28}px "Playfair Display", serif`;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(displayText || dateStr, topSide * 1.5, height - bottom * 0.52);
        drawHeart(ctx, width - topSide * 1.8, height - bottom * 0.5, bottom * 0.35, true, "#f472b6");
        break;
      }
      case "polaroid": {
        const side = width * 0.05;
        const bottom = height * 0.22;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, width, side);
        ctx.fillRect(0, 0, side, height);
        ctx.fillRect(width - side, 0, side, height);
        ctx.fillRect(0, height - bottom, width, bottom);
        ctx.fillStyle = "#3f3f46";
        ctx.textAlign = "center";
        ctx.font = `italic 400 ${bottom * 0.22}px "Playfair Display", serif`;
        ctx.fillText(displayText || "Today with you ✨", width / 2, height - bottom * 0.55);
        ctx.font = `400 ${bottom * 0.1}px "Inter", sans-serif`;
        ctx.fillStyle = "#a1a1aa";
        ctx.fillText(dateStr, width / 2, height - bottom * 0.28);
        break;
      }
      case "instagram": {
        const cardX = 0;
        const cardY = 0;
        const cardW = width;
        const cardH = height;
        const headerH = cardH * 0.14;
        const mediaH = cardH * 0.72;
        const actionsH = cardH - headerH - mediaH;
        const mediaY = cardY + headerH;
        const actionsY = mediaY + mediaH;
        const textY = actionsY + actionsH;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(cardX, cardY, cardW, headerH);
        ctx.fillRect(cardX, actionsY, cardW, actionsH);
        ctx.fillRect(cardX, mediaY, cardW * 0.02, mediaH);
        ctx.fillRect(cardX + cardW * 0.98, mediaY, cardW * 0.02, mediaH);

        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = Math.max(1, width * 0.0012);
        ctx.strokeRect(cardX, cardY, cardW, cardH);
        ctx.strokeRect(cardX, mediaY, cardW, mediaH);

        const avatarR = headerH * 0.24;
        const avatarX = cardX + cardW * 0.08;
        const avatarY = cardY + headerH * 0.5;
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.strokeStyle = "#111111";
        ctx.lineWidth = Math.max(1.4, width * 0.0025);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(avatarX, avatarY - avatarR * 0.3, avatarR * 0.22, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(avatarX, avatarY + avatarR * 0.12, avatarR * 0.45, Math.PI * 0.1, Math.PI * 0.9);
        ctx.stroke();

        ctx.fillStyle = "#1f2937";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.font = `${Math.max(12, headerH * 0.2)}px "Inter", sans-serif`;
        const nameX = avatarX + avatarR * 1.8;
        const nameMaxWidth = cardW * 0.72;
        ctx.fillText(displayText || "user_name", nameX, avatarY, nameMaxWidth);

        const dotsX = cardX + cardW - cardW * 0.07;
        for (let i = 0; i < 3; i += 1) {
          ctx.beginPath();
          ctx.arc(dotsX + i * 4, avatarY, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = "#111111";
          ctx.fill();
        }

        ctx.strokeStyle = "#d1d5db";
        ctx.lineWidth = Math.max(1, width * 0.0012);
        ctx.strokeRect(cardX, mediaY, cardW, mediaH);

        const iconSize = actionsH * 0.35;
        const iconY = actionsY + actionsH * 0.5;
        drawHeart(ctx, cardX + cardW * 0.07, iconY - iconSize * 0.45, iconSize, false, "#111111");
        ctx.beginPath();
        ctx.arc(cardX + cardW * 0.16, iconY, iconSize * 0.38, 0, Math.PI * 2);
        ctx.strokeStyle = "#111111";
        ctx.lineWidth = Math.max(1.6, width * 0.0018);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cardX + cardW * 0.24, iconY + iconSize * 0.12);
        ctx.lineTo(cardX + cardW * 0.31, iconY - iconSize * 0.2);
        ctx.lineTo(cardX + cardW * 0.245, iconY - iconSize * 0.31);
        ctx.closePath();
        ctx.stroke();
        const bookmarkX = cardX + cardW * 0.93;
        const bookmarkY = iconY - iconSize * 0.45;
        const bookmarkW = iconSize * 0.52;
        const bookmarkH = iconSize * 0.9;
        ctx.strokeRect(bookmarkX, bookmarkY, bookmarkW, bookmarkH);
        ctx.beginPath();
        ctx.moveTo(bookmarkX, bookmarkY + bookmarkH);
        ctx.lineTo(bookmarkX + bookmarkW * 0.5, bookmarkY + bookmarkH * 0.73);
        ctx.lineTo(bookmarkX + bookmarkW, bookmarkY + bookmarkH);
        ctx.stroke();
        break;
      }
      case "minimal": {
        const border = width * 0.02;
        ctx.strokeStyle = "rgba(255,255,255,0.6)";
        ctx.lineWidth = border;
        ctx.strokeRect(border / 2, border / 2, width - border, height - border);
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = `300 ${Math.max(10, width * 0.015)}px "Inter", sans-serif`;
        const label = (displayText || "MOMENTS").toUpperCase();
        ctx.fillText(label, width / 2, height - height * 0.18);
        break;
      }
      default: {
        const border = width * 0.02;
        ctx.strokeStyle = "rgba(255,255,255,0.6)";
        ctx.lineWidth = border;
        ctx.strokeRect(border / 2, border / 2, width - border, height - border);
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.font = `300 ${Math.max(10, width * 0.015)}px "Inter", sans-serif`;
        ctx.fillText((displayText || "MOMENTS").toUpperCase(), width / 2, height - height * 0.18);
      }
    }
    ctx.shadowBlur = 0;
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
  };

  const renderOverlayFromStaticClone = async (scale: number) => {
    if (!frameOverlayRef.current) return null;
    const sourceOverlay = frameOverlayRef.current;
    const sourceInputs = Array.from(sourceOverlay.querySelectorAll("input[type='text']")) as HTMLInputElement[];
    const overlayRect = sourceOverlay.getBoundingClientRect();
    const dateStr = new Date().toLocaleDateString("vi-VN");
    const cacheKey = [
      FRAME_TEMPLATE_VERSION,
      selectedFrame,
      customText,
      dateStr,
      Math.round(scale * 1000),
      Math.round(overlayRect.width),
      Math.round(overlayRect.height)
    ].join("|");
    const cached = overlayCacheRef.current.get(cacheKey);
    if (cached) {
      return { canvas: cached, overlayRect };
    }

    const cssWidth = Math.max(1, Math.round(overlayRect.width));
    const cssHeight = Math.max(1, Math.round(overlayRect.height));
    const host = document.createElement("div");
    host.style.position = "fixed";
    host.style.left = "-99999px";
    host.style.top = "0";
    host.style.width = `${cssWidth}px`;
    host.style.height = `${cssHeight}px`;
    host.style.pointerEvents = "none";
    host.style.overflow = "hidden";
    document.body.appendChild(host);

    try {
      const clonedOverlay = sourceOverlay.cloneNode(true) as HTMLElement;
      clonedOverlay.style.position = "relative";
      clonedOverlay.style.inset = "0";
      clonedOverlay.style.width = `${cssWidth}px`;
      clonedOverlay.style.height = `${cssHeight}px`;
      clonedOverlay.style.pointerEvents = "none";
      host.appendChild(clonedOverlay);

      const cloneInputs = Array.from(clonedOverlay.querySelectorAll("input[type='text']")) as HTMLInputElement[];
      cloneInputs.forEach((cloneInput, idx) => {
        const sourceInput = sourceInputs[idx];
        const textNode = document.createElement("span");
        textNode.textContent = sourceInput?.value || sourceInput?.placeholder || "";
        textNode.className = cloneInput.className;
        textNode.style.display = "block";
        textNode.style.whiteSpace = "nowrap";
        textNode.style.overflow = "hidden";
        textNode.style.textOverflow = "ellipsis";
        cloneInput.replaceWith(textNode);
      });

      const allNodes = clonedOverlay.querySelectorAll("*");
      allNodes.forEach((el) => {
        const node = el as HTMLElement;
        node.style.animation = "none";
        node.style.transition = "none";
      });

      const canvas = await toCanvas(clonedOverlay, {
        cacheBust: true,
        pixelRatio: Math.max(1, scale),
        width: cssWidth,
        height: cssHeight
      });
      overlayCacheRef.current.set(cacheKey, canvas);
      return { canvas, overlayRect };
    } finally {
      host.remove();
    }
  };

  useEffect(() => {
    if (!isActive || isFrameCacheReady || isCapturing || isPrewarmInFlightRef.current) return;
    const video = videoRef.current;
    const captureArea = captureAreaRef.current;
    if (!video || !captureArea || !video.videoWidth || !video.videoHeight) return;

    let cancelled = false;
    const previousFrame = selectedFrame;
    isPrewarmInFlightRef.current = true;
    setIsPrewarmingFrames(true);
    (async () => {
      const scale = video.videoWidth / captureArea.getBoundingClientRect().width;
      try {
        overlayCacheRef.current.clear();
        for (const frame of PHOTO_FRAMES) {
          if (cancelled) return;
          setSelectedFrame(frame.id);
          await new Promise<void>((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
          });
          await renderOverlayFromStaticClone(scale);
        }
        if (cancelled) return;
        setSelectedFrame(previousFrame);
      } catch (error) {
        if (cancelled) return;
        setSelectedFrame(previousFrame);
        console.error("Prewarm all frames failed", error);
      } finally {
        isPrewarmInFlightRef.current = false;
        if (!cancelled) setIsPrewarmingFrames(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isActive, isFrameCacheReady, isCapturing]);

  const capturePhoto = async () => {
    if (isCapturing) {
      return;
    }
    if (!isFrameCacheReady) {
      return;
    }
    setIsCapturing(true);
    if (!videoRef.current || !canvasRef.current || !captureAreaRef.current) {
      setIsCapturing(false);
      return;
    }
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const captureArea = captureAreaRef.current;
    try {
      if (!video.videoWidth || !video.videoHeight) {
        return;
      }
      const captureRect = captureArea.getBoundingClientRect();
      const previewAspect = captureRect.width / captureRect.height;
      const videoAspect = video.videoWidth / video.videoHeight;
      let sourceX = 0;
      let sourceY = 0;
      let sourceW = video.videoWidth;
      let sourceH = video.videoHeight;

      if (videoAspect > previewAspect) {
        sourceW = video.videoHeight * previewAspect;
        sourceX = (video.videoWidth - sourceW) / 2;
      } else if (videoAspect < previewAspect) {
        sourceH = video.videoWidth / previewAspect;
        sourceY = (video.videoHeight - sourceH) / 2;
      }
      const baseWidth = Math.round(sourceW);
      const baseHeight = Math.round(sourceH);
      const longEdge = Math.max(baseWidth, baseHeight);
      const upscaleRatio = longEdge < CAPTURE_MIN_LONG_EDGE ? CAPTURE_MIN_LONG_EDGE / longEdge : 1;
      canvas.width = Math.round(baseWidth * upscaleRatio);
      canvas.height = Math.round(baseHeight * upscaleRatio);
      const finalCtx = canvas.getContext("2d");
      if (!finalCtx) {
        return;
      }
      finalCtx.imageSmoothingEnabled = true;
      finalCtx.imageSmoothingQuality = "high";
      finalCtx.save();
      finalCtx.translate(canvas.width, 0);
      finalCtx.scale(-1, 1);
      finalCtx.drawImage(
        video,
        sourceX,
        sourceY,
        sourceW,
        sourceH,
        0,
        0,
        canvas.width,
        canvas.height
      );
      finalCtx.restore();
      const scale = canvas.width / captureRect.width;
      const overlay = frameOverlayRef.current;
      const overlayStart = Date.now();
      try {
        const rendered = await renderOverlayFromStaticClone(scale);
        if (rendered) {
          const offsetX = (rendered.overlayRect.left - captureRect.left) * scale;
          const offsetY = (rendered.overlayRect.top - captureRect.top) * scale;
          finalCtx.drawImage(
            rendered.canvas,
            offsetX,
            offsetY,
            rendered.canvas.width,
            rendered.canvas.height
          );
        } else {
          drawSelectedFrame(finalCtx, canvas.width, canvas.height);
        }
      } catch (overlayError) {
        drawSelectedFrame(finalCtx, canvas.width, canvas.height);
      }

      const dataUrl = canvas.toDataURL("image/png");
      setCaptures((prev) => {
        const next = [dataUrl, ...prev];
        return next;
      });

      const flash = document.createElement("div");
      flash.className = "fixed inset-0 bg-white z-[200] pointer-events-none transition-opacity duration-300";
      document.body.appendChild(flash);
      setTimeout(() => {
        flash.style.opacity = "0";
        setTimeout(() => flash.remove(), 300);
      }, 50);
    } catch (error) {
      console.error("Capture failed:", error);
    } finally {
      setIsCapturing(false);
    }
  };

  const downloadAll = async () => {
    captures.forEach((img, i) => {
      const link = document.createElement('a');
      link.href = img;
      link.download = `amour-memory-${i}.png`;
      link.click();
    });
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto px-2 md:px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">

        {/* Photo Stack / Gallery - Left Side */}
        <div className="lg:col-span-4 order-2 lg:order-1 relative min-h-[300px] md:min-h-[400px] flex items-center justify-center">
          <AnimatePresence>
            {captures.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-zinc-300 italic font-serif text-lg text-center border-2 border-dashed border-zinc-100 rounded-[2rem] p-8 md:p-12 w-full"
              >
                Chưa có ảnh nào... <br />
                Hãy cùng nhau tạo nên kỷ niệm nhé!
              </motion.div>
            ) : (
              <div className="relative w-full h-full flex flex-col items-center">
                <div className="relative w-full aspect-[3/2] max-w-[320px] md:max-w-[400px]">
                  {captures.slice(0, 5).map((img, i) => (
                    <motion.div
                      key={img}
                      drag
                      dragConstraints={{ left: -300, right: 300, top: -300, bottom: 300 }}
                      onDragStart={() => setIsStackDragging(true)}
                      onDragEnd={() => {
                        setTimeout(() => setIsStackDragging(false), 100);
                      }}
                      initial={{ opacity: 0, x: 200, rotate: 20, scale: 0.5 }}
                      animate={{
                        opacity: 1,
                        x: i * -15,
                        y: i * 10,
                        rotate: i * -5,
                        scale: 1 - (i * 0.05),
                        zIndex: 100 - i
                      }}
                      whileHover={{ y: -20, zIndex: 110, transition: { duration: 0.3 } }}
                      onClick={() => {
                        if (!isStackDragging) setEnlargedPhoto(img);
                      }}
                      className="absolute inset-0 bg-white p-2 md:p-3 shadow-xl cursor-grab active:cursor-grabbing ring-1 ring-zinc-100"
                    >
                      <img src={img} className="w-full h-full object-cover shadow-inner pointer-events-none" />
                    </motion.div>
                  ))}
                </div>

                {captures.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12 md:mt-16 flex gap-4"
                  >
                    <button
                      onClick={downloadAll}
                      className="px-6 py-3 bg-zinc-900 text-white rounded-full font-sans text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-800 transition-colors"
                    >
                      <Download className="w-3 h-3" /> Lưu ({captures.length})
                    </button>
                    <button
                      onClick={() => setCaptures([])}
                      className="px-6 py-3 border border-zinc-200 text-zinc-400 rounded-full font-sans text-[10px] uppercase tracking-widest hover:bg-zinc-50 transition-colors"
                    >
                      Xóa
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Live Camera View - Center/Right */}
        <div className="lg:col-span-8 order-1 lg:order-2 space-y-4">
          {devices.length > 1 && (
            <div className="flex justify-center gap-4">
              <div className="relative inline-block w-full max-w-[160px]">
                <select
                  value={selectedDeviceId}
                  onChange={handleDeviceChange}
                  className="w-full pl-4 pr-10 py-2 text-[10px] uppercase tracking-widest font-bold bg-white/50 backdrop-blur-md border border-pink-100 rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all text-zinc-600"
                >
                  {devices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `Camera ${devices.indexOf(device) + 1}`}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-pink-400">
                  <Camera className="w-3 h-3" />
                </div>
              </div>
            </div>
          )}

          {/* Frame Selector */}
          <div className="flex justify-center overflow-x-auto pb-2 no-scrollbar">
            <div className="flex gap-3 px-4">
              {PHOTO_FRAMES.map((frame) => (
                <button
                  key={frame.id}
                  onClick={() => setSelectedFrame(frame.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-[9px] uppercase tracking-wider font-bold transition-all border ${selectedFrame === frame.id
                      ? 'bg-pink-500 text-white border-pink-500 shadow-lg shadow-pink-200'
                      : 'bg-white/50 text-zinc-500 border-zinc-100 hover:border-pink-200'
                    }`}
                >
                  {frame.label}
                </button>
              ))}
            </div>
          </div>


          <div className="relative group shadow-2xl overflow-hidden">
            {!isCameraRequested ? (
              <div className="relative aspect-[3/2] bg-zinc-900/95 border border-zinc-800 flex flex-col items-center justify-center gap-5">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartCamera}
                  className="w-20 h-20 rounded-full bg-white/10 border border-white/30 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  <Camera className="w-9 h-9" />
                </motion.button>
                <p className="font-serif italic text-white/80">Bấm để bật camera</p>
              </div>
            ) : (
            <div ref={captureAreaRef} data-capture-root="true" className="relative aspect-[3/2] bg-zinc-900 group">
              {isActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover transform scale-x-[-1]"
                  />

                  {/* Real-time Frame Preview Overlay */}
                  <div ref={frameOverlayRef} className="absolute inset-0 pointer-events-none z-20">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={selectedFrame}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 w-full h-full"
                      >
                        {selectedFrame === 'classic' && (
                          <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-0 left-0 right-0 h-[5%] bg-white" />
                            <div className="absolute top-0 left-0 bottom-0 w-[5%] bg-white" />
                            <div className="absolute top-0 right-0 bottom-0 w-[5%] bg-white" />
                            <div className="absolute left-0 right-0 bottom-0 h-[12.5%] bg-white flex items-center justify-between px-[7.5%]">
                              <input
                                type="text"
                                value={customText}
                                onChange={(e) => setCustomText(e.target.value)}
                                placeholder={new Date().toLocaleDateString('vi-VN')}
                                className="text-[clamp(10px,2.2vw,16px)] text-zinc-500 font-serif italic bg-transparent border-none focus:outline-none pointer-events-auto w-full max-w-[80%] placeholder:text-zinc-300"
                              />
                              <Heart className="w-[clamp(14px,2.8vw,24px)] h-[clamp(14px,2.8vw,24px)] text-pink-400 fill-pink-400 flex-shrink-0" />
                            </div>
                          </div>
                        )}

                        {selectedFrame === 'polaroid' && (
                          <div className="absolute inset-0 flex flex-col">
                            <div className="flex-1 border-x-[5%] border-t-[5%] border-white" />
                            <div className="h-[22%] bg-white flex flex-col justify-center items-center px-4">
                              <input
                                type="text"
                                value={customText}
                                onChange={(e) => setCustomText(e.target.value)}
                                placeholder="Today with you ✨"
                                className="text-[clamp(10px,2.3vw,18px)] font-serif italic text-zinc-700 tracking-wide text-center bg-transparent border-none focus:outline-none pointer-events-auto w-full px-2 placeholder:text-zinc-300"
                              />
                              <p className="text-[clamp(8px,1.5vw,11px)] text-zinc-400 opacity-60 pointer-events-none">{new Date().toLocaleDateString('vi-VN')}</p>
                            </div>
                          </div>
                        )}

                        {selectedFrame === 'instagram' && (
                          <div className="absolute inset-0 overflow-hidden">
                            <div className="h-[14%] bg-white border border-zinc-200 border-b-0 px-[4%] flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                                <div className="w-6 h-6 rounded-full border-2 border-black flex items-center justify-center">
                                  <div className="relative w-3 h-3">
                                    <div className="absolute left-1/2 top-0 -translate-x-1/2 w-1.5 h-1.5 rounded-full border border-black" />
                                    <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-3 h-1.5 rounded-t-full border border-black border-b-0" />
                                  </div>
                                </div>
                                <input
                                  type="text"
                                  value={customText}
                                  onChange={(e) => setCustomText(e.target.value)}
                                  placeholder="user_name"
                                  className="text-[10px] md:text-xs text-zinc-800 bg-transparent border-none focus:outline-none pointer-events-auto flex-1 min-w-0 placeholder:text-zinc-500"
                                />
                              </div>
                              <span className="text-zinc-900 text-sm leading-none">...</span>
                            </div>
                            <div className="h-[72%] border border-zinc-200 bg-transparent overflow-hidden" />
                            <div className="h-[14%] bg-white border border-zinc-200 border-t-0 px-[4%] flex items-center justify-between text-zinc-900">
                              <div className="flex items-center gap-3">
                                <Heart className="w-4 h-4 text-zinc-900" />
                                <MessageCircle className="w-4 h-4 text-zinc-900" />
                                <Send className="w-4 h-4 text-zinc-900" />
                              </div>
                              <Bookmark className="w-4 h-4 text-zinc-900" />
                            </div>
                          </div>
                        )}

                        {selectedFrame === 'minimal' && (
                          <div className="absolute inset-0 p-[6%]">
                            <div className="w-full h-full border border-white/60 flex items-end justify-center pb-[2%]">
                              <input
                                type="text"
                                value={customText}
                                onChange={(e) => setCustomText(e.target.value)}
                                placeholder="MOMENTS"
                                className="text-[clamp(8px,1.4vw,12px)] text-white tracking-[0.6em] font-sans font-light uppercase bg-transparent border-none focus:outline-none pointer-events-auto w-full text-center placeholder:text-white/40"
                              />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Viewfinder Decorative UI */}
                  <div className="absolute inset-0 pointer-events-none z-10">
                    <div className="absolute top-10 left-10 w-8 h-8 border-t-2 border-l-2 border-white/20" />
                    <div className="absolute top-10 right-10 w-8 h-8 border-t-2 border-r-2 border-white/20" />
                    <div className="absolute bottom-10 left-10 w-8 h-8 border-b-2 border-l-2 border-white/20" />
                    <div className="absolute bottom-10 right-10 w-8 h-8 border-b-2 border-r-2 border-white/20" />
                  </div>
                  {isPrewarmingFrames && (
                    <div className="absolute inset-0 z-30 bg-zinc-950/55 backdrop-blur-sm flex flex-col items-center justify-center gap-4 pointer-events-auto">
                      <div className="w-14 h-14 rounded-full border-4 border-zinc-300/20 border-t-pink-300 animate-spin" />
                      <p className="font-serif italic text-white/90">Đang tải sẵn toàn bộ khung...</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 space-y-4">
                  <div className="w-16 h-16 rounded-full border-4 border-zinc-700 border-t-pink-400 animate-spin" />
                  <p className="font-serif italic">
                    {shouldRunCamera ? "Đang khởi tạo camera..." : "Bấm để bật camera"}
                  </p>
                </div>
              )}
            </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* New Controls Center */}
          <div className="flex flex-col items-center gap-10 mt-12 bg-white/50 backdrop-blur-sm p-8 rounded-[3rem] border border-white shadow-xl">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={capturePhoto}
              disabled={!isActive || isCapturing || !isFrameCacheReady}
              className="relative group flex items-center justify-center p-1 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 shadow-2xl shadow-pink-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="bg-white rounded-full p-6 group-hover:p-5 transition-all">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-pink-500 flex items-center justify-center text-white shadow-inner">
                  <Camera className="w-8 h-8 md:w-10 md:h-10" />
                </div>
              </div>

              {isCapturing ? (
                <div className="absolute -inset-1 rounded-full border-4 border-pink-300 border-t-pink-500 animate-spin pointer-events-none" />
              ) : (
                <div className="absolute inset-0 rounded-full border-4 border-pink-200 animate-ping opacity-25 pointer-events-none" />
              )}
            </motion.button>

            <p className="text-center text-[10px] uppercase tracking-[0.4em] text-zinc-400 font-bold px-4">Lưu giữ từng nụ cười của em</p>
          </div>
        </div>
      </div>

      {/* Lightbox / Enlarged Photo */}
      <AnimatePresence mode="wait">
        {enlargedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-zinc-950/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12"
            onClick={() => setEnlargedPhoto(null)}
          >
            <div className="absolute inset-0 flex items-center justify-between px-4 md:px-12 pointer-events-none">
              <motion.button
                whileHover={{ scale: 1.1, x: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); navigatePhoto('prev'); }}
                className="p-4 rounded-full bg-white/10 text-white backdrop-blur-md pointer-events-auto hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); navigatePhoto('next'); }}
                className="p-4 rounded-full bg-white/10 text-white backdrop-blur-md pointer-events-auto hover:bg-white/20 transition-colors"
              >
                <ArrowRight className="w-6 h-6" />
              </motion.button>
            </div>

            <motion.div
              key={enlargedPhoto}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x > 100) navigatePhoto('prev');
                else if (info.offset.x < -100) navigatePhoto('next');
              }}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative max-w-4xl w-full h-full flex items-center justify-center"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={enlargedPhoto}
                className="max-w-full max-h-full object-contain shadow-2xl pointer-events-none select-none"
              />

              <div className="absolute top-0 right-0 p-4 flex gap-3">
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = enlargedPhoto;
                    link.download = 'amour-memory.png';
                    link.click();
                  }}
                  className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
                >
                  <Download className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setEnlargedPhoto(null)}
                  className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-[10px] uppercase tracking-[0.3em] font-medium hidden md:block">
                Vuốt để xem thêm • {captures.indexOf(enlargedPhoto) + 1} / {captures.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SectionHeading = ({ children, subtitle, align = "center" }: { children: React.ReactNode; subtitle?: string; align?: "center" | "left" }) => (
  <div className={`${align === "center" ? "text-center" : "text-left"} mb-16 space-y-4`}>
    {subtitle && (
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 0.5, y: 0 }}
        viewport={{ once: true }}
        animate={{
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 1 }
        }}
        className="text-[10px] uppercase tracking-[0.5em] font-sans font-bold text-romantic-gold"
      >
        {subtitle}
      </motion.p>
    )}
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        y: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        opacity: { duration: 1.2 }
      }}
      className="text-4xl md:text-6xl font-serif text-zinc-800"
    >
      {children}
    </motion.h2>
  </div>
);

// --- Main App ---

export default function App() {
  const shouldReduceMotion = useReducedMotion();
  const [isMobileViewport, setIsMobileViewport] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );
  const [hasStarted, setHasStarted] = useState(false);
  const [isRomanticCameraVisible, setIsRomanticCameraVisible] = useState(false);
  const [isMilestoneAnimating, setIsMilestoneAnimating] = useState(true);
  const [isMilestonePaused, setIsMilestonePaused] = useState(false);
  const [isMilestoneRewinding, setIsMilestoneRewinding] = useState(false);
  const [milestoneEdgePadding, setMilestoneEdgePadding] = useState(0);
  const milestoneScrollerRef = useRef<HTMLDivElement>(null);
  const memorySectionRef = useRef<HTMLElement>(null);
  const gallerySectionRef = useRef<HTMLElement>(null);
  const milestoneSectionRef = useRef<HTMLElement>(null);
  const isMilestoneDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  const milestoneRewindFrameRef = useRef<number | null>(null);
  const [isMemorySectionInView, setIsMemorySectionInView] = useState(true);
  const [isGallerySectionInView, setIsGallerySectionInView] = useState(true);
  const [isMilestoneSectionInView, setIsMilestoneSectionInView] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const scaleProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);
  const isLowPerfMode = shouldReduceMotion || isMobileViewport;
  const allImageUrls = useMemo(() => getAllImageUrls(), []);
  const timelineImageGroups = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(TIMELINE_IMAGE_FILE_GROUPS).map(([stage, fileNames]) => [
          stage,
          fileNames.map((fileName) => getImageUrlByName(fileName)).filter(Boolean)
        ])
      ) as Record<keyof typeof TIMELINE_IMAGE_FILE_GROUPS, string[]>,
    []
  );

  const startJourney = () => {
    setHasStarted(true);
  };

  const replayMilestones = () => {
    const scroller = milestoneScrollerRef.current;
    if (!scroller || isMilestoneRewinding) return;

    if (milestoneRewindFrameRef.current !== null) {
      cancelAnimationFrame(milestoneRewindFrameRef.current);
    }

    setIsMilestoneAnimating(false);
    setIsMilestonePaused(true);
    setIsMilestoneRewinding(true);

    const from = scroller.scrollLeft;
    const to = getMilestoneStartScrollLeft(scroller);
    const rewindDurationMs = 550;
    const startAt = performance.now();

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const rewind = (now: number) => {
      const elapsed = now - startAt;
      const progress = Math.min(elapsed / rewindDurationMs, 1);
      const eased = easeOutCubic(progress);
      scroller.scrollLeft = from + (to - from) * eased;

      if (progress < 1) {
        milestoneRewindFrameRef.current = requestAnimationFrame(rewind);
        return;
      }

      scroller.scrollLeft = to;
      milestoneRewindFrameRef.current = null;
      setIsMilestoneRewinding(false);
      setIsMilestonePaused(false);
      setIsMilestoneAnimating(true);
    };

    milestoneRewindFrameRef.current = requestAnimationFrame(rewind);
  };

  const getMilestoneEndScrollLeft = (scroller: HTMLDivElement) => {
    const maxScrollLeft = Math.max(scroller.scrollWidth - scroller.clientWidth, 0);
    const items = scroller.querySelectorAll<HTMLElement>("[data-milestone-item='true']");
    const lastItem = items[items.length - 1];
    if (!lastItem) return maxScrollLeft;

    const target = lastItem.offsetLeft + lastItem.offsetWidth / 2 - scroller.clientWidth / 2;
    return Math.max(0, Math.min(target, maxScrollLeft));
  };

  const getMilestoneStartScrollLeft = (scroller: HTMLDivElement) => {
    const maxScrollLeft = Math.max(scroller.scrollWidth - scroller.clientWidth, 0);
    const items = scroller.querySelectorAll<HTMLElement>("[data-milestone-item='true']");
    const firstItem = items[0];
    if (!firstItem) return 0;

    const target = firstItem.offsetLeft + firstItem.offsetWidth / 2 - scroller.clientWidth / 2;
    return Math.max(0, Math.min(target, maxScrollLeft));
  };

  useEffect(() => {
    const updateViewport = () => {
      setIsMobileViewport(window.innerWidth < 768);
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    const scroller = milestoneScrollerRef.current;
    if (!scroller) return;

    const updateMilestoneEdgePadding = () => {
      const firstItem = scroller.querySelector<HTMLElement>("[data-milestone-item='true']");
      if (!firstItem) return;
      const nextPadding = Math.max((scroller.clientWidth - firstItem.offsetWidth) / 2, 0);
      setMilestoneEdgePadding(nextPadding);
    };

    updateMilestoneEdgePadding();
    window.addEventListener("resize", updateMilestoneEdgePadding);
    return () => window.removeEventListener("resize", updateMilestoneEdgePadding);
  }, []);

  useEffect(() => {
    const scroller = milestoneScrollerRef.current;
    if (!scroller) return;
    const id = requestAnimationFrame(() => {
      scroller.scrollLeft = getMilestoneStartScrollLeft(scroller);
    });
    return () => cancelAnimationFrame(id);
  }, [milestoneEdgePadding]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isVisible = entry.isIntersecting && entry.intersectionRatio > 0.08;
          if (entry.target === memorySectionRef.current) {
            setIsMemorySectionInView(isVisible);
          } else if (entry.target === gallerySectionRef.current) {
            setIsGallerySectionInView(isVisible);
          } else if (entry.target === milestoneSectionRef.current) {
            setIsMilestoneSectionInView(isVisible);
          }
        });
      },
      { threshold: [0, 0.08, 0.2, 0.5] }
    );

    if (memorySectionRef.current) observer.observe(memorySectionRef.current);
    if (gallerySectionRef.current) observer.observe(gallerySectionRef.current);
    if (milestoneSectionRef.current) observer.observe(milestoneSectionRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isMilestoneAnimating) return;

    let frameId = 0;
    let lastTick = performance.now();
    const runDurationMs = 140000;
    const scroller = milestoneScrollerRef.current;
    if (!scroller) return;
    const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;
    const startScrollLeft = getMilestoneStartScrollLeft(scroller);
    const endScrollLeft = getMilestoneEndScrollLeft(scroller);

    if (maxScrollLeft <= 0 || endScrollLeft <= startScrollLeft) {
      setIsMilestoneAnimating(false);
      return;
    }

    const runDistance = endScrollLeft - startScrollLeft;
    const speedPxPerMs = runDistance / runDurationMs;

    const tick = (now: number) => {
      if (!isMilestonePaused) {
        const elapsed = now - lastTick;
        const normalizedScrollLeft = Math.max(scroller.scrollLeft, startScrollLeft);
        const nextScroll = Math.min(normalizedScrollLeft + elapsed * speedPxPerMs, endScrollLeft);
        scroller.scrollLeft = nextScroll;
        if (nextScroll >= endScrollLeft - 1) {
          scroller.scrollLeft = endScrollLeft;
          setIsMilestoneAnimating(false);
          return;
        }
      }

      lastTick = now;
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isMilestoneAnimating, isMilestonePaused]);

  useEffect(() => {
    return () => {
      if (milestoneRewindFrameRef.current !== null) {
        cancelAnimationFrame(milestoneRewindFrameRef.current);
      }
    };
  }, []);

  const startMilestoneDrag = (clientX: number) => {
    const scroller = milestoneScrollerRef.current;
    if (!scroller) return;
    isMilestoneDraggingRef.current = true;
    dragStartXRef.current = clientX;
    dragStartScrollLeftRef.current = scroller.scrollLeft;
    setIsMilestonePaused(true);
  };

  const moveMilestoneDrag = (clientX: number) => {
    const scroller = milestoneScrollerRef.current;
    if (!scroller || !isMilestoneDraggingRef.current) return;
    const deltaX = clientX - dragStartXRef.current;
    const startScrollLeft = getMilestoneStartScrollLeft(scroller);
    const endScrollLeft = getMilestoneEndScrollLeft(scroller);
    const nextScrollLeft = dragStartScrollLeftRef.current - deltaX;
    scroller.scrollLeft = Math.max(startScrollLeft, Math.min(nextScrollLeft, endScrollLeft));
    if (scroller.scrollLeft >= endScrollLeft - 1) {
      scroller.scrollLeft = endScrollLeft;
      setIsMilestoneAnimating(false);
    }
  };

  const endMilestoneDrag = () => {
    isMilestoneDraggingRef.current = false;
    setIsMilestonePaused(false);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden selection:bg-pink-100 selection:text-pink-900 bg-[#fffdfc] cursor-default">
      {/* INTRO OVERLAY */}
      <AnimatePresence>
        {!hasStarted && (
          <motion.div
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1] }}
            className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5 }}
              className="space-y-8"
            >
              <div className="relative inline-block">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                >
                  <Mail className="w-16 h-16 text-pink-200 stroke-[1px]" />
                </motion.div>
                <div className="absolute -top-2 -right-2">
                  <Heart className="w-6 h-6 text-pink-500 fill-pink-500 animate-pulse" />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-serif text-zinc-800">Một món quà dành riêng cho em</h2>
                <p className="text-zinc-400 font-sans tracking-[0.2em] text-xs uppercase">Chạm vào trái tim để mở ra thế giới của chúng mình</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={startJourney}
                className="group relative flex items-center justify-center w-24 h-24 rounded-full bg-pink-50 hover:bg-pink-100 transition-colors mx-auto"
              >
                <Heart className="w-10 h-10 text-pink-500 fill-transparent group-hover:fill-pink-500 transition-all duration-500" />
                <motion.div
                  className="absolute inset-0 rounded-full border border-pink-200"
                  animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Line */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-100 via-pink-300 to-pink-100 origin-left z-50"
        style={{ scaleX: scaleProgress }}
      />

      {/* HERO SECTION - Enhanced with Parallax Elements */}
      <header className="relative h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative z-10 space-y-12">

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-pink-100/30 blur-[120px] rounded-full -z-10"
          />

          <div className="space-y-6">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: [0.5, 0.8, 0.5],
                y: 0
              }}
              transition={{
                opacity: { duration: 4, repeat: Infinity, ease: "linear", delay: 1.5 },
                y: { duration: 1.5, delay: 1 }
              }}
              className="text-xs md:text-sm tracking-[0.6em] uppercase font-sans font-bold"
            >
              since the very first day
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{
                opacity: 1,
                y: [0, -20, 0],
              }}
              transition={{
                opacity: { duration: 2, delay: 0.5 },
                y: { duration: 12, repeat: Infinity, ease: "easeInOut" }
              }}
              className="text-7xl md:text-[10rem] font-serif text-zinc-900 leading-[0.8] tracking-tighter"
            >
              Eternal <br /> <span className="italic font-light text-5xl md:text-9xl text-pink-300/80">Affection</span>
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="flex items-center justify-center gap-8"
          >
            <div className="w-12 h-[1px] bg-zinc-200" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Star className="text-romantic-gold/40 w-4 h-4" />
            </motion.div>
            <div className="w-12 h-[1px] bg-zinc-200" />
          </motion.div>
        </motion.div>

        {/* Floating Decorative Elements */}
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 opacity-20 pointer-events-none"
        >
          <Heart className="w-12 h-12 text-pink-200 fill-pink-100" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 opacity-10 pointer-events-none"
        >
          <Sparkles className="w-16 h-16 text-yellow-200" />
        </motion.div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute bottom-12 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] tracking-[0.3em] uppercase text-zinc-300 font-bold">Cuộn để khám phá</span>
          <ChevronDown className="w-4 h-4 text-zinc-200" />
        </motion.div>
      </header>

      {/* JOURNEY SECTION */}
      <main className="max-w-7xl mx-auto px-6 space-y-48 pb-64">

        {/* Memory Box - Interactive */}
        <section ref={memorySectionRef} className="relative min-h-[85vh] flex items-center justify-center">
          <SectionHeading subtitle="vùng ký ức">Nơi Cảm Xúc Bắt Đầu</SectionHeading>

          <SecretNote x="8%" y="12%" isAnimated={!shouldReduceMotion && isMemorySectionInView}>Sự dịu dàng chính là thứ cốt lõi khiến anh mê mẩn về em</SecretNote>
          <SecretNote x="88%" y="15%" isAnimated={!shouldReduceMotion && isMemorySectionInView}>Cảm ơn vì đã luôn là ánh nắng của riêng anh.</SecretNote>
          <SecretNote x="12%" y="85%" isAnimated={!shouldReduceMotion && isMemorySectionInView}>Mỗi ngày bên em là một trang nhật ký đẹp nhất.</SecretNote>
          <SecretNote x="85%" y="82%" isAnimated={!shouldReduceMotion && isMemorySectionInView}>Anh chưa bao giờ hối hận vì ngày ấy đã nói lời chào.</SecretNote>
          <SecretNote x="50%" y="5%" isAnimated={!shouldReduceMotion && isMemorySectionInView}>Chúng ta cứ yêu nhau bình yên thôi</SecretNote>
          <SecretNote x="48%" y="92%" isAnimated={!shouldReduceMotion && isMemorySectionInView}>Cứ ôm anh thật chặt nhé</SecretNote>
          <SecretNote x="18%" y="48%" isAnimated={!shouldReduceMotion && isMemorySectionInView}>Em là điều tuyệt vời nhất mà anh từng có.</SecretNote>
          <SecretNote x="78%" y="52%" isAnimated={!shouldReduceMotion && isMemorySectionInView}>Anh yêu em, thương em rất nhiều</SecretNote>
          <SecretNote x="35%" y="28%" isAnimated={!shouldReduceMotion && isMemorySectionInView}>Nhớ những cái nắm tay thật chặt khi ta bên nhau.</SecretNote>
          <SecretNote x="62%" y="35%" isAnimated={!shouldReduceMotion && isMemorySectionInView}>Nụ cười, vẻ đẹp, sự quyến rũ và mùi hương của em làm anh tan chảy.</SecretNote>

          <div className="absolute inset-0 mask-radial-fade opacity-30 pointer-events-none">
            <div className="w-full h-full border-[1px] border-zinc-100 rounded-[100px] rotate-12" />
            <div className="absolute inset-0 border-[1px] border-zinc-100 rounded-[100px] -rotate-6" />
          </div>
        </section>

        {/* Immersive Gallery Section */}
        <section ref={gallerySectionRef} className="space-y-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h3 className="text-4xl md:text-5xl font-serif text-zinc-800 leading-tight">Mỗi ngày, một <br /><span className="italic text-pink-400">bất ngờ nhỏ</span></h3>
              <p className="text-xl text-zinc-500 font-light leading-relaxed font-body italic">
                "Cuộc sống không phải những gì ta đếm được, mà là những khoảnh khắc làm ta nín thở. Em là người đã mang lại cho anh hàng vạn khoảnh khắc như thế."
              </p>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full glass flex items-center justify-center"><Camera className="w-5 h-5 text-pink-300" /></div>
                <div className="w-12 h-12 rounded-full glass flex items-center justify-center"><Music className="w-5 h-5 text-pink-300" /></div>
              </div>
            </motion.div>

            <div className="relative group">
              <SecretStack imagePool={isGallerySectionInView ? allImageUrls : allImageUrls.slice(0, 4)} />
            </div>
          </div>
        </section>

        {/* Horizontal Scroll Memory Lane (Infinite Carousel) */}
        <section ref={milestoneSectionRef} className="py-20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-pink-50/20 skew-y-3 -z-10" />
          <SectionHeading subtitle="những cột mốc" align="center">Chặng Đường Hạnh Phúc</SectionHeading>

          <div className="flex relative items-center">
            {/* Left Fade */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#fffdfc] to-transparent z-20 pointer-events-none" />
            {/* Right Fade */}
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#fffdfc] to-transparent z-20 pointer-events-none" />

            <div
              ref={milestoneScrollerRef}
              onMouseDown={(e) => startMilestoneDrag(e.clientX)}
              onMouseMove={(e) => moveMilestoneDrag(e.clientX)}
              onMouseUp={endMilestoneDrag}
              onMouseLeave={endMilestoneDrag}
              onTouchStart={(e) => startMilestoneDrag(e.touches[0].clientX)}
              onTouchMove={(e) => moveMilestoneDrag(e.touches[0].clientX)}
              onTouchEnd={endMilestoneDrag}
              className="overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing select-none"
              style={{ scrollBehavior: isMilestoneSectionInView ? "auto" : "smooth" }}
            >
              <div className="flex gap-8 py-4">
                <div
                  aria-hidden="true"
                  className="shrink-0"
                  style={{ width: milestoneEdgePadding }}
                />
                {(() => {
                  const usageByStage: Record<string, number> = {};
                  const allMilestones = [
                    { stage: "firstMeet", t: "Trên chuyến đi lần đầu tiên gặp nhau", d: "Khi có thể nói rằng định mệnh đã sắp đặt" },
                    { stage: "firstDate", t: "Buổi hẹn hò đầu tiên", d: "Khi anh còn ngây ngô, vụng về nhất" },
                    { stage: "firstDate", t: "Buổi hẹn hò đầu tiên", d: "Khi anh còn ngây ngô, vụng về nhất" },
                    { stage: "nextDates", t: "Buổi hẹn hò tiếp theo", d: "Khi cả hai có sự đồng điệu" },
                    { stage: "nextDates", t: "Buổi hẹn hò tiếp theo", d: "Khi cả hai có sự đồng điệu" },
                    { stage: "nextDates", t: "Buổi hẹn hò tiếp theo", d: "Khi cả hai có sự đồng điệu" },
                    { stage: "nextDates", t: "Buổi hẹn hò tiếp theo", d: "Khi cả hai có sự đồng điệu" },
                    { stage: "gifts", t: "Những món quà", d: "Có thể là bình dị, đơn giản, nhưng mang trong đó những tình cảm yêu thương thật lớn lao" },
                    { stage: "gifts", t: "Những món quà", d: "Có thể là bình dị, đơn giản, nhưng mang trong đó những tình cảm yêu thương thật lớn lao" },
                    { stage: "gifts", t: "Những món quà", d: "Có thể là bình dị, đơn giản, nhưng mang trong đó những tình cảm yêu thương thật lớn lao" },
                    { stage: "gifts", t: "Những món quà", d: "Có thể là bình dị, đơn giản, nhưng mang trong đó những tình cảm yêu thương thật lớn lao" },
                    { stage: "gifts", t: "Những món quà", d: "Có thể là bình dị, đơn giản, nhưng mang trong đó những tình cảm yêu thương thật lớn lao" },
                    { stage: "trips", t: "Những chuyến đi", d: "Dù là không đi cùng nhau, nhưng vẫn nhớ về nhau" },
                    { stage: "trips", t: "Những chuyến đi", d: "Dù là không đi cùng nhau, nhưng vẫn nhớ về nhau" },
                    { stage: "trips", t: "Những chuyến đi", d: "Dù là không đi cùng nhau, nhưng vẫn nhớ về nhau" },
                    { stage: "trips", t: "Những chuyến đi", d: "Dù là không đi cùng nhau, nhưng vẫn nhớ về nhau" },
                    { stage: "trips", t: "Những chuyến đi", d: "Dù là không đi cùng nhau, nhưng vẫn nhớ về nhau" },
                    { stage: "finally", t: "Cuối cùng thì", d: "Anh đã lấy hết can đảm, và anh đã có thể nắm tay người con gái mà anh thầm yêu, thầm nhớ" },
                    { stage: "finally", t: "Cuối cùng thì", d: "Anh đã lấy hết can đảm, và anh đã có thể nắm tay người con gái mà anh thầm yêu, thầm nhớ" },
                    { stage: "finally", t: "Cuối cùng thì", d: "Anh đã lấy hết can đảm, và anh đã có thể nắm tay người con gái mà anh thầm yêu, thầm nhớ" },
                    { stage: "finally", t: "Cuối cùng thì", d: "Anh đã lấy hết can đảm, và anh đã có thể nắm tay người con gái mà anh thầm yêu, thầm nhớ" },
                    { stage: "finally", t: "Cuối cùng thì", d: "Anh đã lấy hết can đảm, và anh đã có thể nắm tay người con gái mà anh thầm yêu, thầm nhớ" },
                    { stage: "lastMilestone", t: "Anh yêu em", d: "Anh sẽ ở đây, ở bên em, nắm tay em thật chặt, ôm em thật lâu. Mong em cũng sẽ ôm anh thật chặt. Mong mình sẽ yêu nhau thật lâu. Anh yêu em." }
                  ];
                  const milestones = isLowPerfMode ? allMilestones.filter((_, idx) => idx % 2 === 0) : allMilestones;
                  return milestones
                    .map((milestone) => {
                      const stageImages = timelineImageGroups[milestone.stage as keyof typeof timelineImageGroups];
                      const currentIndex = usageByStage[milestone.stage] ?? 0;
                      usageByStage[milestone.stage] = currentIndex + 1;
                      return {
                        ...milestone,
                        img: stageImages[currentIndex % stageImages.length]
                      };
                    })
                    .map((m, i) => (
                      <motion.div
                        key={i}
                        data-milestone-item="true"
                        whileHover={{ y: -15, scale: 1.02 }}
                        className="flex-shrink-0 w-80 min-h-[500px] glass rounded-[3rem] p-5 group border-white/50 shadow-sm hover:shadow-2xl transition-all duration-500 bg-white/40 flex flex-col"
                      >
                        <div className="w-full h-72 rounded-[2.5rem] overflow-hidden mb-8 relative">
                          <img
                            src={m.img}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover brightness-95 group-hover:brightness-110 transition-all duration-700"
                          />
                          <div className="absolute inset-0 bg-pink-500/0 group-hover:bg-pink-500/10 transition-colors" />
                        </div>
                        <div className="space-y-4 px-2 flex-1">
                          <h4 className="text-2xl font-serif text-zinc-800 tracking-tight">{m.t}</h4>
                          <p className="text-base italic text-zinc-400 font-body leading-relaxed">{m.d}</p>
                        </div>
                        <div className="mt-6 pt-2 flex justify-between items-center px-2 shrink-0">
                          <Heart className="w-5 h-5 text-pink-50 text-pink-200 group-hover:text-pink-500 transition-colors fill-transparent group-hover:fill-pink-500" />
                          <span className="text-[10px] tracking-[0.5em] font-bold text-zinc-200 uppercase">Memory • 0{i + 1}</span>
                        </div>
                      </motion.div>
                    ));
                })()}
                <div
                  aria-hidden="true"
                  className="shrink-0"
                  style={{ width: milestoneEdgePadding }}
                />
              </div>
            </div>
          </div>
          {!isMilestoneAnimating && !isMilestoneRewinding && (
            <div className="mt-10 text-center">
              <button
                onClick={replayMilestones}
                aria-label="Chạy lại"
                title="Chạy lại"
                className="w-12 h-12 rounded-full border border-pink-200 text-pink-500 inline-flex items-center justify-center hover:bg-pink-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}
        </section>

        {/* THE FINAL INVITATION - More Dramatic */}
        <section className="relative py-40 flex flex-col items-center justify-center text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-32 bg-gradient-to-b from-transparent to-pink-200" />

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="space-y-16"
          >
            <div className="space-y-4">
              <motion.h4
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl md:text-[7rem] font-serif text-zinc-900 leading-[1.1] tracking-tighter"
              >
                Giây phút ta <br />
                <span className="text-romantic-gold italic font-light">đang ở bên nhau...</span>
              </motion.h4>
            </div>

            <p className="text-xl md:text-2xl text-zinc-500 font-light italic leading-relaxed max-w-2xl mx-auto font-body">
              "Không cần phải hứa hẹn điều gì xa xôi, chỉ cần tay vẫn nắm chặt, tim vẫn cùng nhịp, và chúng ta ở đây, ngay khoảnh khắc này."
            </p>

            <div className="space-y-12">
              <div className="space-y-4">
                <div className="w-12 h-px bg-pink-200 mx-auto opacity-50" />
                <p className="text-[10px] uppercase tracking-[0.6em] font-bold text-pink-300">Romantic Snapshot</p>
                <h5 className="text-3xl md:text-4xl font-serif text-zinc-800 italic">Hãy cùng lưu giữ khoảnh khắc này nhé?</h5>
              </div>

              {!isRomanticCameraVisible ? (
                <button
                  type="button"
                  onClick={() => setIsRomanticCameraVisible(true)}
                  aria-label="Mở camera"
                  title="Mở camera"
                  className="w-16 h-16 rounded-full border border-pink-200 text-pink-500 inline-flex items-center justify-center hover:bg-pink-50 transition-colors"
                >
                  <Camera className="w-6 h-6" />
                </button>
              ) : (
                <RomanticCamera autoStart />
              )}
            </div>

            <p className="text-[10px] text-zinc-400 uppercase tracking-[0.5em] pt-12">mọi khoảnh khắc bên em đều là điều tuyệt vời nhất</p>
          </motion.div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="py-24 bg-white border-t border-zinc-100 flex flex-col items-center gap-8">
        <div className="w-12 h-12 rounded-full border border-pink-100 flex items-center justify-center">
          <Heart className="w-4 h-4 text-pink-200 fill-pink-200" />
        </div>
        <div className="space-y-2 text-center">
          <p className="text-xs tracking-[0.6em] uppercase text-zinc-400 font-bold">Eternal Love Collection</p>
          <p className="text-[10px] italic text-zinc-300">Design for you, with all my heart</p>
        </div>
        <div className="flex gap-6">
          {[Camera, Music, Star, Zap].map((Icon, i) => (
            <Icon key={i} className="w-3 h-3 text-zinc-200" />
          ))}
        </div>
      </footer>
    </div>
  );
}


