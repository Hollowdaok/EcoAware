import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Container, Button, Modal, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './TrashSortingGame.css';

const importAllImages = (context) => {
  let images = {};
  context.keys().forEach((item) => {
    const key = item.replace('./', '').replace(/\.\w+$/, '');
    images[key] = context(item);
  });
  return images;
};

// Import all images from the trash-items directory
export const trashItemImages = importAllImages(
  require.context('../../assets/images/games', false, /\.(png|jpe?g|svg)$/)
);

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Категорії для сортування сміття
const TRASH_CATEGORIES = {
  PAPER: { id: 'paper', name: 'Папір', color: '#3498db', icon: '📄' },
  PLASTIC: { id: 'plastic', name: 'Пластик', color: '#e74c3c', icon: '🥤' },
  GLASS: { id: 'glass', name: 'Скло', color: '#2ecc71', icon: '🍶' },
  METAL: { id: 'metal', name: 'Метал', color: '#95a5a6', icon: '🥫' },
  ORGANIC: { id: 'organic', name: 'Органіка', color: '#f39c12', icon: '🍎' },
  MIXED: { id: 'mixed', name: 'Змішані', color: '#9b59b6', icon: '🗑️' }
};

// Предмети сміття
const TRASH_ITEMS = [
  { id: 1, name: 'Газета', category: TRASH_CATEGORIES.PAPER.id, image: trashItemImages['paper'] },
  { id: 2, name: 'Пластикова пляшка', category: TRASH_CATEGORIES.PLASTIC.id, image: trashItemImages['plastic_bottle'] },
  { id: 3, name: 'Скляна банка', category: TRASH_CATEGORIES.GLASS.id, image: trashItemImages['glass-jar'] },
  { id: 4, name: 'Консервна банка', category: TRASH_CATEGORIES.METAL.id, image: trashItemImages['tin-can'] },
  { id: 5, name: 'Яблучний недоїдок', category: TRASH_CATEGORIES.ORGANIC.id, image: trashItemImages['apple-core'] },
  { id: 6, name: 'Картонна коробка', category: TRASH_CATEGORIES.PAPER.id, image: trashItemImages['cardboard-box'] },
  { id: 7, name: 'Пластикова упаковка', category: TRASH_CATEGORIES.PLASTIC.id, image: trashItemImages['plastic-packaging'] },
  { id: 8, name: 'Паперовий пакет', category: TRASH_CATEGORIES.PAPER.id, image: trashItemImages['paper-bag'] },
  { id: 9, name: 'Скляна пляшка', category: TRASH_CATEGORIES.GLASS.id, image: trashItemImages['glass-bottle'] },
  { id: 10, name: 'Алюмінієва банка', category: TRASH_CATEGORIES.METAL.id, image: trashItemImages['aluminum-can'] },
  { id: 11, name: 'Банановa шкірка', category: TRASH_CATEGORIES.ORGANIC.id, image: trashItemImages['banana-peel'] },
  { id: 12, name: 'Зламаний телефон', category: TRASH_CATEGORIES.MIXED.id, image: trashItemImages['broken-phone'] },
  { id: 13, name: 'Пляшка від шампуню', category: TRASH_CATEGORIES.PLASTIC.id, image: trashItemImages['shampoo-bottle'] },
  { id: 14, name: 'Яєчна шкаралупа', category: TRASH_CATEGORIES.ORGANIC.id, image: trashItemImages['eggshell'] }
  
];


// Компонент гри
const TrashSortingGame = () => {
  // Використання контексту авторизації
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Стани гри
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentItems, setCurrentItems] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [results, setResults] = useState({ correct: 0, incorrect: 0, total: 0 });
  const [showTutorial, setShowTutorial] = useState(true);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const timerRef = useRef(null);
  const gameContainerRef = useRef(null);

  // Рівні складності - обгорнуті у useMemo для запобігання зайвим ререндерам
  const difficulties = useMemo(() => ({
    1: { itemCount: 4, timeLimit: 60, speedMultiplier: 1 },
    2: { itemCount: 4, timeLimit: 50, speedMultiplier: 1.2 },
    3: { itemCount: 4, timeLimit: 40, speedMultiplier: 1.5 }
  }), []);

  // Генерувати випадкові предмети для поточного рівня
  const generateItems = () => {
    const itemCount = difficulties[level].itemCount;
    const shuffledItems = [...TRASH_ITEMS].sort(() => 0.5 - Math.random());
    return shuffledItems.slice(0, itemCount);
  };

  // Запустити нову гру
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setShowTutorial(false);
    setScore(0);
    
    // Встановлюємо час відповідно до обраного рівня
    const selectedTimeLimit = difficulties[level].timeLimit;
    setTimeLeft(selectedTimeLimit);
    
    setCurrentItems(generateItems());
    setResults({ correct: 0, incorrect: 0, total: 0 });
    
    // Зупиняємо попередній таймер, якщо він існує
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Запуск таймера
    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          endGame();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  };
  
  // Завершення гри
  const endGame = () => {
    clearInterval(timerRef.current);
    setGameOver(true);
    setShowResultModal(true);
    
    // Збереження результатів на сервері
    saveGameResults();
  };

  // Збереження результатів на сервері
  const saveGameResults = async () => {
    try {
      // Якщо користувач не авторизований, показуємо модальне вікно з пропозицією авторизуватися
      if (!isAuthenticated) {
        setShowAuthModal(true);
        return;
      };
      
      // Переконуємось, що всі дані передаються як числа
      const gameData = {
        level: Number(level),
        score: Number(score),
        correct: Number(results.correct),
        incorrect: Number(results.incorrect),
        total: Number(results.total),
        playTime: Number(difficulties[level].timeLimit - timeLeft)
      };
      
      const response = await fetch(`${API_URL}/games/trash-sorting/results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Важливо для передачі cookie з авторизацією
        body: JSON.stringify(gameData),
      });
      
      let data;
      
      try {
        // Спочатку отримуємо відповідь як текст
        const textResponse = await response.text();
        
        // Спробуємо розпарсити відповідь як JSON
        try {
          data = JSON.parse(textResponse);
        } catch (parseError) {
          console.error('Помилка при розборі відповіді сервера як JSON:', parseError);
          data = { message: textResponse }; // Використовуємо текст як повідомлення
        }
      } catch (responseError) {
        console.error('Помилка при читанні відповіді сервера:', responseError);
        throw new Error(`Помилка при обробці відповіді сервера: ${responseError.message}`);
      }
      
      // Перевіряємо статус відповіді
      if (!response.ok) {
        // Детальний лог для помилки
        console.error('Відповідь сервера з помилкою:', response.status, data);
        
        // Якщо помилка авторизації, пропонуємо користувачу авторизуватися
        if (response.status === 401) {
          setShowAuthModal(true);
          throw new Error(`Для збереження результатів необхідно авторизуватися`);
        }
        
        throw new Error(`HTTP помилка ${response.status}: ${JSON.stringify(data)}`);
      }
      
      return data;
    } catch (error) {
      console.error('Помилка при збереженні результатів:', error);
      
      // Якщо це помилка авторизації, пропонуємо користувачу авторизуватися
      if (error.message && (error.message.includes('401') || error.message.includes('авторизуватися'))) {
        setShowAuthModal(true);
      }
      
      return null;
    }
  };

const handleDrop = (category, e) => {
  e.preventDefault();
  
  // Безпечно видаляємо клас, перевіривши, що e.currentTarget існує
  if (e.currentTarget) {
    e.currentTarget.classList.remove('drag-over');
  }
  
  if (draggedItem) {
    const isCorrect = draggedItem.category === category.id;
    
    // Знаходимо елемент, який перетягнули
    const draggedElement = document.querySelector(`.trash-item[data-id="${draggedItem.id}"]`);
    
    if (draggedElement && e.currentTarget) {
      // Отримуємо координати цілі (контейнера)
      const targetRect = e.currentTarget.getBoundingClientRect();
      const targetCenterX = targetRect.left + targetRect.width / 2;
      const targetCenterY = targetRect.top + targetRect.height / 2;
      
      // Створюємо анімований елемент
      const animatedItem = draggedElement.cloneNode(true);
      animatedItem.style.position = 'fixed';
      animatedItem.style.zIndex = '9999';
      animatedItem.style.width = '100px';
      animatedItem.style.height = '120px';
      animatedItem.style.left = `${draggedElement.getBoundingClientRect().left}px`;
      animatedItem.style.top = `${draggedElement.getBoundingClientRect().top}px`;
      animatedItem.style.transition = 'all 0.3s ease-in-out';
      animatedItem.style.pointerEvents = 'none';
      
      document.body.appendChild(animatedItem);
      
      // Спочатку ховаємо оригінальний елемент
      draggedElement.style.opacity = '0';
      
      // Запускаємо анімацію переміщення до контейнера
      setTimeout(() => {
        animatedItem.style.left = `${targetCenterX - 50}px`;
        animatedItem.style.top = `${targetCenterY - 60}px`;
        animatedItem.style.opacity = '0.7';
        animatedItem.style.transform = 'scale(0.7)';
      }, 10);
      
      // Додаємо анімацію для контейнера
      e.currentTarget.classList.add(isCorrect ? 'correct-sort' : 'incorrect-sort');
      
      // Видаляємо анімований елемент після завершення анімації
      setTimeout(() => {
        if (document.body.contains(animatedItem)) {
          document.body.removeChild(animatedItem);
        }
        if (e.currentTarget) {
          e.currentTarget.classList.remove('correct-sort', 'incorrect-sort');
        }
      }, 400);
    }
    
    // Оновлення результатів
    const newResults = { ...results };
    newResults.total += 1;
    
    if (isCorrect) {
      // Додаємо очки за правильну відповідь (10 * рівень складності)
      setScore(prevScore => prevScore + 10 * level);
      newResults.correct += 1;
    } else {
      // Віднімаємо очки за неправильну відповідь (5 * рівень складності)
      // але не дозволяємо рахунку стати менше 0
      setScore(prevScore => Math.max(0, prevScore - 5 * level));
      newResults.incorrect += 1;
    }
    
    setResults(newResults);
    
    // Видалення предмета з поточних і додавання нового
    setCurrentItems(prevItems => {
      const updatedItems = prevItems.filter(item => item.id !== draggedItem.id);
      const newItem = TRASH_ITEMS.find(item => !prevItems.some(i => i.id === item.id) && 
                                       !updatedItems.some(i => i.id === item.id));
      
      if (newItem && updatedItems.length < difficulties[level].itemCount) {
        return [...updatedItems, newItem];
      }
      
      // Якщо не залишилось нових предметів, закінчуємо гру
      if (updatedItems.length === 0) {
        endGame();
      }
      
      return updatedItems;
    });
    
    setDraggedItem(null);
  }
};

// Безпечний обробник для handleDragOver
const handleDragOver = (e) => {
  e.preventDefault();
  // Додаємо клас для підсвічування контейнера, над яким зараз перетягується предмет
  if (e.currentTarget) {
    e.currentTarget.classList.add('drag-over');
  }
};

// Безпечний обробник для handleDragLeave
const handleDragLeave = (e) => {
  // Видаляємо клас підсвічування при виході з зони контейнера
  if (e.currentTarget) {
    e.currentTarget.classList.remove('drag-over');
  }
};

// Безпечний обробник для handleDragEnd
const handleDragEnd = () => {
  // Скидаємо стан перетягування
  setDraggedItem(null);
  
  // Видаляємо клас підсвічування з усіх контейнерів
  const bins = document.querySelectorAll('.trash-bin');
  if (bins) {
    bins.forEach(bin => {
      if (bin) {
        bin.classList.remove('drag-over');
      }
    });
  }
};


const handleDragStart = (item, e) => {
  setDraggedItem(item);
  
  // Створюємо власне зображення для перетягування
  if (e.dataTransfer) {
    e.dataTransfer.setData('text/plain', item.id);
    
    try {
      // Створюємо власний елемент для перетягування
      const dragImage = document.createElement('div');
      dragImage.className = 'custom-drag-image';
      
      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.name;
      img.style.width = '75px';
      img.style.height = '75px';
      img.style.objectFit = 'contain';
      
      const name = document.createElement('div');
      name.textContent = item.name;
      name.style.fontSize = '12px';
      name.style.textAlign = 'center';
      name.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
      name.style.padding = '2px';
      name.style.borderRadius = '3px';
      
      dragImage.appendChild(img);
      dragImage.appendChild(name);
      
      // Додаємо елемент в DOM (він буде тимчасовий)
      document.body.appendChild(dragImage);
      
      // Встановлюємо елемент як зображення для перетягування
      e.dataTransfer.setDragImage(dragImage, 40, 40);
      
      // Видаляємо тимчасовий елемент після короткої затримки
      setTimeout(() => {
        if (document.body.contains(dragImage)) {
          document.body.removeChild(dragImage);
        }
      }, 0);
    } catch (error) {
      console.error('Помилка при створенні drag image:', error);
      // Якщо виникла помилка, використовуємо стандартний спосіб (без кастомного зображення)
    }
  }
};
  // Обробник переходу на наступний рівень
  const handleNextLevel = () => {
    if (level < 3) {
      setLevel(prevLevel => prevLevel + 1);
      setShowResultModal(false);
      startGame();
    } else {
      // Якщо це був останній рівень
      setShowResultModal(false);
      setGameStarted(false);
      setLevel(1);
    }
  };

  // Обробник перезапуску поточного рівня
  const handleRetryLevel = () => {
    setShowResultModal(false);
    startGame();
  };
  
  // Обробник переходу до сторінки входу
  const handleLogin = () => {
    setShowAuthModal(false);
    navigate('/login?redirect=/games/trash-sorting');
  };
  
  // Обробник переходу до сторінки реєстрації
  const handleRegister = () => {
    setShowAuthModal(false);
    navigate('/register?redirect=/games/trash-sorting');
  };

  // Очищення таймера при розмонтуванні компонента
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
    };
  }, []);

  // Оновлюємо час при зміні рівня складності
  useEffect(() => {
    if (gameStarted) {
      setTimeLeft(difficulties[level].timeLimit);
    } else {
      // Якщо гра ще не почалася, ініціалізуємо timeLeft відповідно до вибраного рівня
      setTimeLeft(difficulties[level].timeLimit);
    }
  }, [level, gameStarted, difficulties]);

  return (
    <Container className="trash-sorting-game">
      {showTutorial ? (
        <div className="game-tutorial">
          <h2>Гра "Сортування сміття"</h2>
          <p>Навчіться правильно сортувати відходи для переробки!</p>
          
          <div className="tutorial-steps">
            <h3>Як грати:</h3>
            <ol>
              <li>Перетягуйте предмети до відповідних контейнерів для сортування</li>
              <li>За правильне сортування отримуєте очки</li>
              <li>Намагайтеся відсортувати якомога більше предметів до завершення часу</li>
              <li>З кожним рівнем складність зростає</li>
            </ol>
          </div>
          
          <div className="difficulty-select">
            <h3>Виберіть рівень складності:</h3>
            <div className="difficulty-buttons">
              <Button variant="success" onClick={() => { setLevel(1); startGame(); }}>
                Легкий (60 сек)
              </Button>
              <Button variant="warning" onClick={() => { setLevel(2); startGame(); }}>
                Середній (50 сек)
              </Button>
              <Button variant="danger" onClick={() => { setLevel(3); startGame(); }}>
                Складний (40 сек)
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {gameStarted && !gameOver && (
            <div className="game-interface" ref={gameContainerRef}>
              <div className="game-header">
                <div className="game-info">
                  <div className="level-indicator">Рівень: {level}</div>
                  <div className="score-indicator">Рахунок: {score}</div>
                </div>
                <div className="timer">
                  <div className="time-left">Час: {timeLeft} сек</div>
                  <ProgressBar 
                    now={timeLeft} 
                    max={difficulties[level].timeLimit} 
                    variant={timeLeft < 10 ? "danger" : timeLeft < 20 ? "warning" : "success"} 
                  />
                </div>
              </div>
              
              <div className="game-content">
                <div className="trash-items-container">
                  {currentItems.map(item => (
                    <div 
                      key={item.id}
                      className="trash-item"
                      data-id={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(item, e)}
                      onDragEnd={handleDragEnd}
                    >
                      <img src={item.image} alt={item.name} />
                      <div className="item-name">{item.name}</div>
                    </div>
                  ))}
                </div>
                
                <div className="trash-bins-container">
                  {Object.values(TRASH_CATEGORIES).map(category => (
                    <div 
                      key={category.id}
                      className="trash-bin"
                      style={{ backgroundColor: category.color }}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(category, e)}
                    >
                      <div className="bin-icon">{category.icon}</div>
                      <div className="bin-name">{category.name}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="game-footer">
                <div className="stats">
                  <div>Правильно: {results.correct}</div>
                  <div>Неправильно: {results.incorrect}</div>
                </div>
                <Button variant="secondary" onClick={endGame}>Завершити гру</Button>
              </div>
            </div>
          )}
          
          {(!gameStarted || gameOver) && !showResultModal && (
            <div className="game-menu">
              <h2>Гра "Сортування сміття"</h2>
              <p>Навчіться правильно сортувати відходи для переробки!</p>
              <Button variant="primary" size="lg" onClick={startGame}>
                {gameOver ? 'Грати знову' : 'Почати гру'}
              </Button>
              {gameOver && (
                <div className="game-over-stats">
                  <h3>Результати:</h3>
                  <p>Рівень: {level}</p>
                  <p>Рахунок: {score}</p>
                  <p>Правильно відсортовано: {results.correct}</p>
                  <p>Помилки: {results.incorrect}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Модальне вікно результатів */}
      <Modal show={showResultModal} onHide={() => setShowResultModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Результати рівня {level}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="results-container">
            <h3>Вітаємо!</h3>
            <p>Ви набрали: <strong>{score} очків</strong></p>
            <div className="results-stats">
              <p>Правильно відсортовано: {results.correct}</p>
              <p>Помилок: {results.incorrect}</p>
              <p>Точність: {results.total > 0 ? Math.round((results.correct / results.total) * 100) : 0}%</p>
            </div>
            
            {!isAuthenticated && (
              <div className="auth-notification">
                <div className="auth-message">
                  <i className="bi bi-exclamation-circle"></i>
                  <p><strong>Увійдіть або зареєструйтесь</strong> для збереження результатів 
                  та участі в таблиці рекордів!</p>
                </div>
                <div className="auth-buttons">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => setShowAuthModal(true)}
                  >
                    Вхід / Реєстрація
                  </Button>
                </div>
              </div>
            )}
            
            <div className="eco-fact">
              <h4>Чи знаєте ви?</h4>
              <p>Правильне сортування відходів дозволяє переробляти до 70% сміття, значно зменшуючи забруднення навколишнього середовища.</p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleRetryLevel}>
            Спробувати ще раз
          </Button>
          {level < 3 ? (
            <Button variant="primary" onClick={handleNextLevel}>
              Наступний рівень
            </Button>
          ) : (
            <Button variant="success" onClick={() => {
              setShowResultModal(false);
              setGameStarted(false);
              setLevel(1);
            }}>
              Завершити гру
            </Button>
          )}
        </Modal.Footer>
      </Modal>
      
      {/* Модальне вікно авторизації */}
      <Modal show={showAuthModal} onHide={() => setShowAuthModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Авторизація</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="auth-modal-content">
            <p className="text-center mb-4">
              Для збереження результатів та участі в рейтингу, будь ласка, 
              увійдіть у свій обліковий запис або створіть новий.
            </p>
            
            <div className="d-grid gap-3">
              <Button 
                variant="primary" 
                size="lg" 
                onClick={handleLogin}
                className="w-100"
              >
                Увійти
              </Button>
              
              <Button 
                variant="outline-primary" 
                size="lg" 
                onClick={handleRegister}
                className="w-100"
              >
                Зареєструватися
              </Button>
              
              <div className="mt-3 text-center text-muted">
                <small>
                  Після авторизації ваші результати будуть автоматично збережені
                  та відображені в таблиці рекордів.
                </small>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default TrashSortingGame;