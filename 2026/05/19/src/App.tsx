import {useMemo, useRef, useState} from 'react';
import {AnimatePresence, motion, useReducedMotion} from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Disc3,
  Heart,
  Music2,
  Pause,
  Play,
  RefreshCw,
  Sparkles,
  Wand2,
} from 'lucide-react';

type Scene = {
  kicker: string;
  title: string;
  copy: string;
  whisper: string;
};

type Backstage = {
  title: string;
  note: string;
};

type Chapter = 'journey' | 'album' | 'shuffle' | 'letter';

const scenes: Scene[] = [
  {
    kicker: 'Track 01',
    title: 'Ngày mình bắt đầu',
    copy: 'Có vài khoảnh khắc đi qua rất khẽ, nhưng ở lại rất lâu.',
    whisper: 'Một cái bắt đầu nhỏ.',
  },
  {
    kicker: 'Track 02',
    title: 'Một lần anh vẫn nhớ',
    copy: 'Chỉ cần có nàng bên cạnh, một ngày bình thường cũng thành đáng nhớ.',
    whisper: 'Một ngày rất dịu.',
  },
  {
    kicker: 'Track 03',
    title: 'Lúc em làm anh mềm lòng',
    copy: 'Đôi khi công chúa chỉ cười thôi, mà trong anh mọi thứ đã dịu xuống.',
    whisper: 'Một nụ cười anh nhớ.',
  },
  {
    kicker: 'Track 04',
    title: 'Một điều rất em bé',
    copy: 'Anh thích những điều nhỏ ở em. Nhỏ thôi, nhưng làm anh muốn thương nhiều hơn.',
    whisper: 'Đáng yêu rất riêng.',
  },
  {
    kicker: 'Track 05',
    title: 'Những ngày có em',
    copy: 'Có em rồi, anh mới biết bình yên cũng có thể làm người ta nhớ mãi.',
    whisper: 'Bình yên cũng lấp lánh.',
  },
  {
    kicker: 'Track 06',
    title: 'Điều anh muốn giữ lại',
    copy: 'Anh chọn cảm giác được đi cùng em. Chậm thôi, nhưng thật lòng.',
    whisper: 'Một lời nhắn cuối.',
  },
];

const backstage: Backstage[] = [
  {
    title: 'Ảnh 01',
    note: 'Một tấm ảnh sau này sẽ đặt ở đây. Còn bây giờ, anh để lại một vùng sáng nhỏ cho kỷ niệm của tụi mình.',
  },
  {
    title: 'Ảnh 02',
    note: 'Có những ngày chỉ cần nhớ lại thôi cũng thấy trong lòng mềm ra một chút.',
  },
  {
    title: 'Ảnh 03',
    note: 'Dành cho một lần công chúa cười rất xinh, và anh giả vờ bình thường nhưng thật ra nhớ rất lâu.',
  },
  {
    title: 'Ảnh 04',
    note: 'Dành cho một khoảnh khắc rất nhỏ, nhưng đủ làm cả ngày hôm đó trở nên đáng yêu hơn.',
  },
  {
    title: 'Ảnh 05',
    note: 'Dành cho em bé, người khiến những điều giản dị cũng có cảm giác như một phần encore.',
  },
  {
    title: 'Ảnh 06',
    note: 'Dành cho những tấm ảnh tụi mình sẽ còn chụp, những nơi sẽ còn đi, những ngày sẽ còn thương.',
  },
];

const loveLines = [
  'Có nàng, mọi thứ dịu hơn một chút.',
  'Công chúa không cần phải hoàn hảo. Với anh, em chỉ cần là em thôi.',
  'Nếu bình yên có âm thanh, chắc là giọng em.',
  'Anh muốn thương em bằng những điều tử tế và đều đặn.',
  'Em bé làm anh muốn sống chậm lại.',
  'Trong lòng anh luôn có một chỗ rất mềm cho nàng.',
];

const playlist = [
  {title: 'Soft Opening', artist: 'Track dành cho nàng', src: 'assets/music/1.mp3'},
  {title: 'Pink Glass Memory', artist: 'Track dành cho công chúa', src: 'assets/music/2.mp3'},
  {title: 'Encore For Em Be', artist: 'Track dành cho em bé', src: 'assets/music/3.mp3'},
];

function App() {
  const reduceMotion = useReducedMotion();
  const experienceRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const [activeScene, setActiveScene] = useState(0);
  const [selectedBackstage, setSelectedBackstage] = useState<Backstage | null>(null);
  const [lineIndex, setLineIndex] = useState(0);
  const [trackIndex, setTrackIndex] = useState(() => Math.floor(Math.random() * playlist.length));
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioMessage, setAudioMessage] = useState('');
  const [encoreOpen, setEncoreOpen] = useState(false);
  const [activeChapter, setActiveChapter] = useState<Chapter>('journey');

  const currentTrack = playlist[trackIndex];
  const trackSrc = `${import.meta.env.BASE_URL}${currentTrack.src}`;
  const currentScene = scenes[activeScene];
  const chapters: {id: Chapter; label: string}[] = [
    {id: 'journey', label: 'Hành trình'},
    {id: 'album', label: 'Album'},
    {id: 'shuffle', label: 'Shuffle'},
    {id: 'letter', label: 'Lời nhắn'},
  ];

  const floatingLights = useMemo(
    () => Array.from({length: 16}, (_, index) => ({
      id: index,
      left: `${(index * 29 + 8) % 100}%`,
      top: `${(index * 17 + 6) % 92}%`,
      delay: index * 0.22,
    })),
    [],
  );

  const enterShow = () => {
    setHasEntered(true);
    requestAnimationFrame(() => {
      experienceRef.current?.scrollIntoView({behavior: reduceMotion ? 'auto' : 'smooth'});
    });
  };

  const goToScene = (nextScene: number) => {
    setActiveScene(Math.max(0, Math.min(scenes.length - 1, nextScene)));
  };

  const shuffleLine = () => {
    setLineIndex((current) => (current + 1 + Math.floor(Math.random() * (loveLines.length - 1))) % loveLines.length);
  };

  const shuffleTrack = () => {
    const next = (trackIndex + 1 + Math.floor(Math.random() * (playlist.length - 1))) % playlist.length;
    setTrackIndex(next);
    setAudioMessage('');
    setIsPlaying(false);
    requestAnimationFrame(() => {
      void audioRef.current?.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setAudioMessage('Track đang chờ file nhạc thật.');
      });
    });
  };

  const toggleAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    setAudioMessage('');

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setAudioMessage('Track đang chờ file nhạc thật.');
    }
  };

  return (
    <main className="app-shell">
      <div className="soft-ambient" aria-hidden="true">
        {floatingLights.map((light) => (
          <span key={light.id} style={{left: light.left, top: light.top, animationDelay: `${light.delay}s`}} />
        ))}
      </div>

      <section className="opening" aria-labelledby="opening-title">
        <motion.div
          className="glass-card opening-card"
          initial={reduceMotion ? false : {opacity: 0, y: 24, scale: 0.98}}
          animate={reduceMotion ? undefined : {opacity: 1, y: 0, scale: 1}}
          transition={{duration: 0.8, ease: [0.16, 1, 0.3, 1]}}
        >
          <p className="eyebrow">19.05 • private glass show</p>
          <h1 id="opening-title">Nếu tình yêu là một buổi diễn, em là phần anh muốn giữ lại lâu nhất.</h1>
          <p>
            Một hành trình nhỏ, thật nhẹ, để công chúa chạm vào những điều anh muốn gửi.
          </p>
          <div className="opening-actions">
            <button className="primary-button" onClick={enterShow}>
              Mở cánh cửa nhỏ
              <ArrowRight size={18} aria-hidden="true" />
            </button>
            <button className="round-button" onClick={toggleAudio} aria-label={isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc'}>
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
          </div>
        </motion.div>
      </section>

      <section className={hasEntered ? 'experience unlocked' : 'experience'} ref={experienceRef} aria-labelledby="experience-title">
        <div className="experience-shell">
          <div className="ticket-strip glass-card">
            <span>Secret ticket</span>
            <strong>Những Điều Dịu Dàng Dành Cho Em</strong>
            <small>Seat: gần trái tim anh nhất</small>
          </div>

          <div className="experience-console glass-card">
            <div className="console-top">
              <div>
                <p className="eyebrow">Private show console</p>
                <h2 id="experience-title">
                  {activeChapter === 'journey' && 'Đi cùng anh qua vài kỷ niệm nhé.'}
                  {activeChapter === 'album' && 'Mở nhẹ vài khung ảnh.'}
                  {activeChapter === 'shuffle' && 'Đổi một chút nhạc và lời thương.'}
                  {activeChapter === 'letter' && 'Một lời nhắn nhỏ ở cuối.'}
                </h2>
              </div>
              <div className="chapter-rail" aria-label="Chọn phần trải nghiệm">
                {chapters.map((chapter) => (
                  <button
                    key={chapter.id}
                    className={activeChapter === chapter.id ? 'chapter-tab active' : 'chapter-tab'}
                    onClick={() => setActiveChapter(chapter.id)}
                  >
                    {chapter.label}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeChapter === 'journey' && (
                <motion.div
                  key="journey"
                  className="console-panel journey-panel"
                  initial={reduceMotion ? false : {opacity: 0, x: 18}}
                  animate={reduceMotion ? undefined : {opacity: 1, x: 0}}
                  exit={reduceMotion ? undefined : {opacity: 0, x: -18}}
                  transition={{duration: 0.34, ease: [0.16, 1, 0.3, 1]}}
                >
                  <div className="scene-meta">
                    <div className="counter" aria-label={`Kỷ niệm ${activeScene + 1} trong ${scenes.length}`}>
                      {String(activeScene + 1).padStart(2, '0')} / {String(scenes.length).padStart(2, '0')}
                    </div>
                    <div className="scene-nav" aria-label="Chọn kỷ niệm">
                      {scenes.map((scene, index) => (
                        <button
                          key={scene.kicker}
                          className={index === activeScene ? 'dot active' : 'dot'}
                          onClick={() => goToScene(index)}
                          aria-label={`Mở ${scene.title}`}
                        />
                      ))}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.article
                      key={currentScene.kicker}
                      className="scene-card"
                      initial={reduceMotion ? false : {opacity: 0, y: 14, scale: 0.99}}
                      animate={reduceMotion ? undefined : {opacity: 1, y: 0, scale: 1}}
                      exit={reduceMotion ? undefined : {opacity: 0, y: -10, scale: 0.99}}
                      transition={{duration: 0.34, ease: [0.16, 1, 0.3, 1]}}
                    >
                      <div className="photo-placeholder">
                        <span>{currentScene.kicker}</span>
                        <strong>{currentScene.whisper}</strong>
                      </div>
                      <div className="scene-text">
                        <p>{currentScene.kicker}</p>
                        <h3>{currentScene.title}</h3>
                        <span>{currentScene.copy}</span>
                      </div>
                    </motion.article>
                  </AnimatePresence>

                  <div className="scene-controls">
                    <button className="secondary-button" onClick={() => goToScene(activeScene - 1)} disabled={activeScene === 0}>
                      <ArrowLeft size={17} />
                      Trước
                    </button>
                    <button
                      className="primary-button"
                      onClick={() => activeScene === scenes.length - 1 ? setActiveChapter('letter') : goToScene(activeScene + 1)}
                    >
                      {activeScene === scenes.length - 1 ? 'Tới lời nhắn' : 'Tiếp theo'}
                      <ArrowRight size={17} />
                    </button>
                  </div>
                </motion.div>
              )}

              {activeChapter === 'album' && (
                <motion.div
                  key="album"
                  className="console-panel album-panel"
                  initial={reduceMotion ? false : {opacity: 0, x: 18}}
                  animate={reduceMotion ? undefined : {opacity: 1, x: 0}}
                  exit={reduceMotion ? undefined : {opacity: 0, x: -18}}
                  transition={{duration: 0.34, ease: [0.16, 1, 0.3, 1]}}
                >
                  <div className="photo-ribbon">
                    {backstage.map((item, index) => (
                      <button key={item.title} className="glass-card photo-tile" onClick={() => setSelectedBackstage(item)}>
                        <span>{item.title}</span>
                        <strong>{String(index + 1).padStart(2, '0')}</strong>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeChapter === 'shuffle' && (
                <motion.div
                  key="shuffle"
                  className="console-panel shuffle-deck"
                  initial={reduceMotion ? false : {opacity: 0, x: 18}}
                  animate={reduceMotion ? undefined : {opacity: 1, x: 0}}
                  exit={reduceMotion ? undefined : {opacity: 0, x: -18}}
                  transition={{duration: 0.34, ease: [0.16, 1, 0.3, 1]}}
                >
                  <div className="music-widget">
                    <div>
                      <p className="eyebrow">Love shuffle</p>
                      <h2 id="shuffle-title">{currentTrack.title}</h2>
                      <span>{currentTrack.artist}</span>
                      {audioMessage && <small>{audioMessage}</small>}
                    </div>
                    <Disc3 className={isPlaying ? 'spinning' : ''} size={104} aria-hidden="true" />
                    <audio
                      ref={audioRef}
                      src={trackSrc}
                      onEnded={() => setIsPlaying(false)}
                      onError={() => {
                        setAudioMessage('Track đang chờ file nhạc thật.');
                        setIsPlaying(false);
                      }}
                    />
                    <div className="mini-actions">
                      <button className="primary-button" onClick={toggleAudio}>
                        {isPlaying ? <Pause size={17} /> : <Play size={17} />}
                        {isPlaying ? 'Tạm dừng' : 'Phát nhạc'}
                      </button>
                      <button className="secondary-button" onClick={shuffleTrack}>
                        <RefreshCw size={17} />
                        Đổi bài
                      </button>
                    </div>
                  </div>

                  <div className="love-widget">
                    <Sparkles size={22} aria-hidden="true" />
                    <p>{loveLines[lineIndex]}</p>
                    <button className="secondary-button" onClick={shuffleLine}>
                      <Wand2 size={17} />
                      Lời thương khác
                    </button>
                  </div>
                </motion.div>
              )}

              {activeChapter === 'letter' && (
                <motion.div
                  key="letter"
                  className="console-panel final-note"
                  initial={reduceMotion ? false : {opacity: 0, x: 18}}
                  animate={reduceMotion ? undefined : {opacity: 1, x: 0}}
                  exit={reduceMotion ? undefined : {opacity: 0, x: -18}}
                  transition={{duration: 0.34, ease: [0.16, 1, 0.3, 1]}}
                >
                  <p className="eyebrow">Confession</p>
                  <h2 id="final-title">Anh không hứa sẽ làm mọi thứ hoàn hảo.</h2>
                  <p>
                    Nhưng anh muốn thương nàng dịu dàng hơn mỗi ngày. Muốn công chúa thấy mình luôn được lắng nghe, được chọn, được trân trọng.
                  </p>
                  <button className="primary-button" onClick={() => setEncoreOpen(true)}>
                    Encore
                    <Heart size={18} fill="currentColor" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedBackstage && (
          <motion.div
            className="modal-backdrop"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            onClick={() => setSelectedBackstage(null)}
          >
            <motion.div
              className="glass-card memory-modal"
              initial={reduceMotion ? false : {opacity: 0, y: 24, scale: 0.96}}
              animate={reduceMotion ? undefined : {opacity: 1, y: 0, scale: 1}}
              exit={reduceMotion ? undefined : {opacity: 0, y: 18, scale: 0.96}}
              onClick={(event) => event.stopPropagation()}
            >
              <Music2 size={24} aria-hidden="true" />
              <h2>{selectedBackstage.title}</h2>
              <p>{selectedBackstage.note}</p>
              <button className="secondary-button" onClick={() => setSelectedBackstage(null)}>Đóng</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {encoreOpen && (
          <motion.div
            className="modal-backdrop"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            onClick={() => setEncoreOpen(false)}
          >
            <motion.div
              className="glass-card encore-modal"
              initial={reduceMotion ? false : {opacity: 0, y: 28, scale: 0.96}}
              animate={reduceMotion ? undefined : {opacity: 1, y: 0, scale: 1}}
              exit={reduceMotion ? undefined : {opacity: 0, y: 20, scale: 0.96}}
              onClick={(event) => event.stopPropagation()}
            >
              <p className="eyebrow">One more thing</p>
              <h2>Encore này dành riêng cho em bé.</h2>
              <p>
                Anh mong sau này, khi tụi mình nhìn lại, 19/5 không chỉ là một trang web nhỏ. Nó là một dấu chấm dịu dàng, nơi anh đã nói thật lòng rằng: được thương em là một điều rất đẹp trong đời anh.
              </p>
              <button className="primary-button" onClick={() => setEncoreOpen(false)}>Giữ lại trong tim</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default App;
