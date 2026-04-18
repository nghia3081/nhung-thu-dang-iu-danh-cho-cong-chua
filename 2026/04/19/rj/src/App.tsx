/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Coffee, 
  MapPin, 
  Music, 
  Sparkles, 
  ChevronRight, 
  Play,
  Calendar,
  Waves,
  Lock,
  KeyRound,
  X
} from 'lucide-react';

const PASSWORD_HASH = "82dffebd16ac063bd01a8fd5af48408ad727e8faa1855f43567c38ad03d0a633";

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Types for our story
interface StoryBeat {
  id: number;
  type: 'text' | 'image' | 'invitation';
  content?: string;
  subContent?: string;
  imageUrl?: string;
  icon?: React.ReactNode;
  locked?: boolean;
  lockHint?: string;
}

const STORY_BEATS: StoryBeat[] = [
  {
    id: 1,
    type: 'text',
    content: "Chào cậu...",
    imageUrl: "./assets/images/1.jpeg",
    subContent: "Có vài điều tớ muốn gửi gắm đến cậu, qua những trang nhỏ này.",
    icon: <Sparkles className="w-8 h-8 text-rose-400/60" />
  },
  {
    id: 2,
    type: 'text',
    content: "Cảm ơn cậu vì đã xuất hiện.",
    subContent: "Sự hiện diện của cậu làm những ngày bình thường của tớ trở nên đặc biệt hơn rất nhiều. Tớ đã từng hỏi mình là: Liệu do mình trở nên dịu dàng hơn nên mới có cơ hội gặp cậu, hay là do gặp cậu nên tớ đã trở nên dịu dàng hơn. Và tớ thấy cả hai đều đúng. Tớ đã có thời gian thử thách để nhìn lại bản thân, giúp bản thân tốt hơn và có lấy cơ hội gặp cậu trong đời. Và khi gặp cậu, mọi thứ trở nên chậm lại, tớ học được cách cảm nhận, trải nghiệm. Cậu đã làm tớ rất vui, làm tớ cảm thấy sự ngọt ngào, làm tớ thấy bình yên, làm tớ dịu dàng hơn.",
    imageUrl: "./assets/images/2.jpeg",
    icon: <Heart className="w-8 h-8 text-rose-500/60" />
  },
  {
    id: 3,
    type: 'image',
    imageUrl: "./assets/images/3.jpeg",
    content: "Cảm ơn cậu vì sự dịu dàng.",
    subContent: "Cách Trang lắng nghe, cách Trang luôn dịu dàng, cách cậu nở nụ cười xinh đẹp,... Tớ thực sự đã tan chảy vì những gì mà Trang đã làm."
  },
  {
    id: 4,
    type: 'text',
    content: "Cảm ơn cậu vì đã luôn đáng yêu. Món quà vô giá của tớ.",
    subContent: "Chẳng biết tớ may mắn đến nhường nào khi được gặp Trang, được ngắm nhìn sự xinh đẹp tuyệt vời đó, được nhìn thấy, nghe thấy sự đáng yêu, sự dễ thương hết sức tưởng tượng đó. Cho dù thế nào đi nữa, cậu là món quà vô giá mà ông trời đã ban cho tớ.",
    imageUrl: "./assets/images/4.png",
    icon: <Sparkles className="w-8 h-8 text-pink-400/60" />
  },
  {
    id: 5,
    type: 'image',
    imageUrl: "./assets/images/5.jpeg",
    content: "Và cảm ơn cậu...",
    subContent: "Vì đã dành sự quan tâm chân thành cho tớ suốt thời gian qua."
  },
  {
    id: 6,
    type: 'text',
    content: "Tớ trân trọng mọi khoảnh khắc mình bên nhau.",
    subContent: "Và tớ muốn chúng mình có thêm nhiều kỷ niệm đẹp nữa. Đã có những lúc tớ phân vân và nghi ngờ. Nhưng bây giờ tớ cảm nhận rõ hơn bao giờ hết. Tớ trân trọng cậu, trân trọng hai ta, trân trọng mọi thứ trong mối quan hệ này. Tớ thích cậu, tớ nhớ cậu, tớ thương cậu, tớ yêu cậu, tớ muốn được che chở cho cậu, tớ muốn mình được bên nhau, đồng hành cùng nhau trên những chặng đường. Tớ nghĩ nó sẽ rất đẹp, rất bình yên, rất hạnh phúc. Và kể cả nếu có những khó khăn, tớ nghĩ chúng ta cũng sẽ cố gắng - cố gắng vì chúng ta và vượt qua được thôi...",
    imageUrl: "./assets/images/6.jpeg",
    icon: <Heart className="w-8 h-8 text-rose-500 fill-rose-500/20" />,
    locked: true,
    lockHint: "Hãy gặp mặt và hỏi Shin lớn mật khẩu nhé..."
  },
  {
    id: 7,
    type: 'invitation',
    content: "Ngày 19 tháng 4 này...",
    imageUrl: "./assets/images/7.jpeg",
    subContent: "Cậu có rảnh để đi cùng tớ không?"
  }
];

const musics = [
  {
    id: 1,
    url: "./assets/music/1.mp3",
    name: "I LOVE YOU"
  },
  {
    id: 2,
    url: "./assets/music/2.mp3",
    name: "Ở trong khu rừng"
  },
  {
    id: 3,
    url: "./assets/music/3.mp3",
    name: "Tâm"
  },
  {
    id: 4,
    url: "./assets/music/4.mp3",
    name: "Mượn rượu tỏ tình"
  },
  {
    id: 5,
    url: "./assets/music/5.mp3",
    name: "Crazy man"
  },
  {
    id: 6,
    url: "./assets/music/6.mp3",
    name: "Bạn đời"
  },
  {
    id: 7,
    url: "./assets/music/7.mp3",
    name: "Nơi này có anh"
  },
]
const getMusic = () => {
  return musics[Math.floor(Math.random() * musics.length)];
}

export default function App() {
  const [currentStep, setCurrentStep] = useState(-1); // -1 is Start Screen
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const [currentMusic, setCurrentMusic] = useState(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [unlocked, setUnlocked] = useState<Record<number, boolean>>({});
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [verifying, setVerifying] = useState(false);
  
  const startExperience = () => {
    setCurrentStep(0);
    setCurrentMusic(getMusic());
    setIsMusicPlaying(true);
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio play deferred", e));
    }
  };

  const nextStep = () => {
    if (currentStep < STORY_BEATS.length - 1) {
      setCurrentStep(prev => prev + 1);
      setShowPwModal(false);
    }
  };

  const reset = () => {
    setCurrentStep(-1);
    setIsMusicPlaying(false);
    setUnlocked({});
    setShowPwModal(false);
    setPwInput("");
    setPwError(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const openLockModal = () => {
    setPwInput("");
    setPwError(false);
    setShowPwModal(true);
  };

  const closeLockModal = () => {
    if (verifying) return;
    setShowPwModal(false);
    setPwInput("");
    setPwError(false);
  };

  const verifyPassword = async () => {
    if (verifying) return;
    setVerifying(true);
    try {
      const hash = await sha256Hex(pwInput.trim().toLowerCase());
      if (hash === PASSWORD_HASH) {
        const currentId = STORY_BEATS[currentStep]?.id;
        if (currentId !== undefined) {
          setUnlocked(prev => ({ ...prev, [currentId]: true }));
        }
        setShowPwModal(false);
        setPwInput("");
        setPwError(false);
      } else {
        setPwError(true);
        setPwInput("");
      }
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    if (audioRef?.current) {
      audioRef?.current.addEventListener('ended', () => {
        setCurrentMusic(getMusic());
      });
    }
  }, [audioRef?.current]);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden font-sans selection:bg-accent/20 bg-[#fffafb]">
      {/* Background with soft light gradients */}
      <div className="absolute inset-0 z-0 bg-atmospheric-light opacity-80" />

      {/* Dynamic Immersive Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AnimatePresence mode="wait">
          {currentStep >= 0 && (
            <motion.div
              key={STORY_BEATS[currentStep].id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0"
            >
              <img 
                src={STORY_BEATS[currentStep].imageUrl || `https://picsum.photos/seed/${STORY_BEATS[currentStep].id + 100}/1200/800`}
                className="w-full h-full object-cover blur-[6px]"
                alt=""
                referrerPolicy="no-referrer"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Signature in corner */}
      <div className="absolute top-10 right-10 font-romantic italic opacity-40 text-sm md:text-base pointer-events-none text-accent">
        Gửi cậu, 19.04.2024
      </div>

      <audio 
        ref={audioRef}
        src={currentMusic?.url} 
        loop
        autoPlay
      />

      <AnimatePresence mode="wait">
        {currentStep === -1 ? (
          <motion.div
            key="start"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="z-10 text-center px-6 gentle-container p-12 md:p-20 max-w-2xl mx-auto"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="mb-8"
            >
              <Heart className="w-16 h-16 text-accent mx-auto drop-shadow-[0_0_15px_rgba(251,113,133,0.3)]" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-serif mb-6 tracking-tight text-text-primary text-glow-light">
              Món quà nhỏ cho ngày 19.04
            </h1>
            <p className="text-text-secondary mb-12 font-romantic text-xl max-w-sm mx-auto italic">
              "Bấm nút để bắt đầu hành trình cùng tớ nhé..."
            </p>
            <button
              onClick={startExperience}
              className="group relative inline-flex items-center gap-3 px-10 py-4 border border-accent/30 rounded-full hover:bg-accent hover:text-white transition-all duration-500 overflow-hidden active:scale-95 text-accent shadow-sm"
            >
              <Play className="w-5 h-5 fill-current" />
              <span className="font-medium tracking-widest uppercase text-sm">Khám phá ngay</span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50, filter: "blur(5px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -50, filter: "blur(5px)" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="z-10 w-full max-w-5xl px-6"
          >
            {STORY_BEATS[currentStep].type === 'invitation' ? (
              <InvitationCard onReset={reset} />
            ) : (
              <div className="gentle-container p-4 md:p-10 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 md:gap-12 min-h-[500px] md:min-h-[600px] items-stretch overflow-hidden">
                {/* Image/Visual Section */}
                <div className="flex flex-col justify-between">
                  <div className="w-full aspect-[4/5] lg:h-[400px] bg-rose-50 rounded-3xl overflow-hidden border border-rose-100 relative group">
                    <motion.img 
                      key={STORY_BEATS[currentStep].imageUrl || 'icon'}
                      initial={{ scale: 1.15 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 2 }}
                      src={STORY_BEATS[currentStep].imageUrl || `https://picsum.photos/seed/${STORY_BEATS[currentStep].id}/800/1000`}
                      alt="Moment"
                      className="w-full h-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Dot Navigation */}
                  <div className="flex gap-2 mt-8 justify-center lg:justify-start">
                    {STORY_BEATS.map((_, i) => (
                      <div 
                        key={i}
                        className={`dot-nav-light ${i === currentStep ? 'dot-nav-active-light' : ''}`}
                      />
                    ))}
                  </div>
                  
                  <div className="mt-8 hidden lg:block border-t border-rose-50 pt-8">
                    <p className="text-[12px] text-text-secondary opacity-60 uppercase tracking-[2px] leading-relaxed italic font-romantic text-glow-light">
                      Lắng nghe giai điệu<br />và cảm nhận khoảnh khắc...
                    </p>
                  </div>
                </div>

                {/* Content Section */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 1 }}
                  className="flex flex-col justify-center lg:pl-10 lg:border-l border-rose-50"
                >
                  <div className="text-[11px] uppercase tracking-[5px] text-accent mb-6 font-bold opacity-80">
                    Một chút để nhớ nhau
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-serif text-glow-light text-text-primary leading-tight mb-8">
                    {STORY_BEATS[currentStep].content}
                  </h2>
                  
                  <div className="mb-12">
                    {STORY_BEATS[currentStep].locked && !unlocked[STORY_BEATS[currentStep].id] ? (
                      <LockedMessage
                        preview={STORY_BEATS[currentStep].subContent || ''}
                        hint={STORY_BEATS[currentStep].lockHint}
                        onClick={openLockModal}
                      />
                    ) : (
                      <motion.p
                        initial={STORY_BEATS[currentStep].locked ? { opacity: 0, y: 8 } : false}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-lg md:text-xl font-romantic italic text-text-secondary leading-relaxed first-letter:text-3xl first-letter:text-accent font-medium"
                      >
                        {STORY_BEATS[currentStep].subContent}
                      </motion.p>
                    )}
                  </div>

                  <div className="mt-auto pt-8">
                    <button
                      onClick={nextStep}
                      className="group flex items-center gap-3 text-white bg-accent/90 hover:bg-accent transition-all py-3.5 px-8 rounded-full shadow-md hover:shadow-lg active:scale-95"
                    >
                      <span className="text-xs font-bold tracking-[3px] uppercase">Tiếp tục hành trình</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Music Control in Corner */}
        <div className="fixed bottom-10 right-10 z-50 flex items-center gap-4 text-[10px] font-bold uppercase tracking-[2px] text-text-secondary">
          <span className="hidden sm:inline-block opacity-40 bg-white/50 px-3 py-1 rounded-full border border-rose-50 translate-y-[-2px]">Music: {currentMusic?.name}</span>
          <button 
            onClick={() => {
              setIsMusicPlaying(!isMusicPlaying);
              if (audioRef.current) {
                if (isMusicPlaying) audioRef.current.pause();
                else audioRef.current.play();
              }
            }}
            className="w-12 h-12 rounded-full border border-accent/20 bg-white/50 backdrop-blur-sm flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-all shadow-sm"
          >
            <div className={`w-0 h-0 border-l-[8px] border-l-current border-y-[5px] border-y-transparent ml-1 ${isMusicPlaying ? 'animate-pulse' : ''}`} />
          </button>
        </div>

      <PasswordModal
        open={showPwModal}
        hint={currentStep >= 0 ? STORY_BEATS[currentStep]?.lockHint : undefined}
        value={pwInput}
        onChange={setPwInput}
        onSubmit={verifyPassword}
        onClose={closeLockModal}
        error={pwError}
        verifying={verifying}
      />
    </div>
  );
}

function InvitationCard({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 30 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="gentle-container p-8 md:p-16 grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-12 items-center">
        <div className="space-y-6">
          <motion.div 
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="w-full aspect-square bg-[#fb7185]/10 rounded-[3rem] flex flex-col items-center justify-center border border-[#fb7185]/20 shadow-inner"
          >
            <Calendar className="w-20 h-20 text-accent/50" />
            <div className="mt-4 text-center">
              <p className="text-accent uppercase tracking-[4px] font-bold text-xs opacity-60">Chủ Nhật</p>
              <p className="text-6xl font-serif mt-1 text-text-primary italic">19.04</p>
            </div>
          </motion.div>
        </div>

        <div className="space-y-8">
          <h2 className="text-4xl md:text-5xl font-serif italic text-text-primary text-glow-light">
            Lời mời gặp gỡ...
          </h2>

          <div className="invitation-gentle-card p-8 space-y-6 font-romantic text-lg italic leading-loose text-text-secondary">
            <div className="flex gap-4 items-start border-b border-rose-100 pb-5">
              <Coffee className="w-6 h-6 text-accent shrink-0 mt-1" />
              <p></p>
            </div>
            
            <div className="flex gap-4 items-start border-b border-rose-100 pb-5">
              <Waves className="w-6 h-6 text-accent shrink-0 mt-1" />
              <p>Thả bộ quanh Hồ Gươm lộng gió, tận hưởng không khí yên bình khi hoàng hôn buông xuống thành phố.</p>
            </div>

            <div className="flex gap-4 items-start">
              <MapPin className="w-6 h-6 text-accent shrink-0 mt-1" />
              <p>Ghé một tiệm nhỏ ven đường dùng bữa tối nhẹ nhàng trước khi tạm biệt nhau.</p>
            </div>
            
            <motion.p 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-center text-accent font-bold mt-8 text-2xl pt-4"
            >
              "Cậu đồng ý đi cùng tớ nhé?"
            </motion.p>
          </div>

          <div className="pt-4">
            <button 
              onClick={onReset}
              className="text-text-secondary/40 hover:text-accent transition-colors text-[10px] uppercase tracking-[4px] pt-4 block font-bold"
            >
              — Khám phá lại từ đầu —
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
function LockedMessage({
  preview,
  hint,
  onClick,
}: {
  preview: string;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full text-left rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50/60 via-white to-pink-50/40 p-6 md:p-8 overflow-hidden transition-all duration-500 hover:border-accent/40 hover:shadow-[0_8px_32px_-12px_rgba(251,113,133,0.35)] active:scale-[0.99]"
    >
      <p
        aria-hidden
        className="text-lg md:text-xl font-romantic italic text-text-secondary leading-relaxed blur-[6px] select-none pointer-events-none line-clamp-4"
      >
        {preview}
      </p>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-white/40 backdrop-blur-[2px]">
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-14 h-14 rounded-full border border-accent/30 bg-white/80 flex items-center justify-center text-accent shadow-sm mb-4 group-hover:bg-accent group-hover:text-white transition-colors duration-500"
        >
          <Lock className="w-6 h-6" />
        </motion.div>
        <p className="text-[11px] uppercase tracking-[4px] text-accent font-bold mb-2">
          Bấm để mở khóa lời nhắn
        </p>
        {hint && (
          <p className="text-sm font-romantic italic text-text-secondary/80 max-w-xs">
            {hint}
          </p>
        )}
      </div>
    </button>
  );
}

function PasswordModal({
  open,
  hint,
  value,
  onChange,
  onSubmit,
  onClose,
  error,
  verifying,
}: {
  open: boolean;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  error: boolean;
  verifying: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="pw-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
        >
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.form
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              x: error ? [0, -8, 8, -6, 6, -3, 3, 0] : 0,
            }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
            className="relative z-10 w-full max-w-md gentle-container p-8 md:p-10"
          >
            <button
              type="button"
              onClick={onClose}
              disabled={verifying}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-text-secondary/50 hover:text-accent hover:bg-rose-50 transition-colors disabled:opacity-40"
              aria-label="Đóng"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center">
              <motion.div
                animate={{ rotate: [0, -6, 6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-5"
              >
                <KeyRound className="w-6 h-6" />
              </motion.div>

              <h3 className="text-2xl md:text-3xl font-serif italic text-text-primary mb-2">
                Ổ khóa nhỏ
              </h3>
              <p className="text-[11px] uppercase tracking-[3px] text-accent/80 font-bold mb-6">
                Nhập mật khẩu để mở lời nhắn
              </p>

              {hint && (
                <div className="w-full bg-rose-50/60 border border-rose-100 rounded-2xl px-4 py-3 mb-6">
                  <p className="text-[10px] uppercase tracking-[2px] text-accent/70 font-bold mb-1">
                    Gợi ý
                  </p>
                  <p className="text-sm font-romantic italic text-text-secondary leading-relaxed">
                    {hint}
                  </p>
                </div>
              )}

              <input
                type="password"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={verifying}
                autoFocus
                placeholder="• • • • • •"
                className={`w-full px-5 py-3.5 rounded-full border bg-white/80 text-center tracking-[6px] text-lg text-text-primary placeholder:text-text-secondary/30 outline-none transition-all ${
                  error
                    ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-rose-100 focus:border-accent/40 focus:ring-2 focus:ring-accent/10"
                } disabled:opacity-50`}
              />

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-red-400 mt-3 font-medium"
                  >
                    Mật khẩu chưa đúng rồi, thử lại nhé...
                  </motion.p>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={verifying || value.trim().length === 0}
                className="mt-7 w-full flex items-center justify-center gap-2 text-white bg-accent/90 hover:bg-accent transition-all py-3.5 px-8 rounded-full shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                <span className="text-xs font-bold tracking-[3px] uppercase">
                  {verifying ? "Đang kiểm tra..." : "Mở khóa"}
                </span>
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

