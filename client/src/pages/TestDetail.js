import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Badge, ProgressBar, Spinner, Alert } from 'react-bootstrap';
import '../styles/TestDetail.css';
// Імпортуємо трекер для відстеження пройдених тестів
import CompletedTestTracker from '../components/tracking/CompletedTestTracker';

const TestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState('intro'); // intro, test, results
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [results, setResults] = useState(null);

  // Завантаження даних тесту
  useEffect(() => {
    const fetchTest = async () => {
      try {
        setLoading(true);
        
        // Спочатку отримуємо загальну інформацію про тест
        const response = await fetch(`http://localhost:5000/api/tests/${id}`);
        
        if (!response.ok) {
          throw new Error('Не вдалося завантажити тест');
        }
        
        const data = await response.json();
        setTest(data);
        
        // Ініціалізуємо масив для відповідей користувача
        setUserAnswers(Array(data.questions.length).fill(null).map(() => ({
          questionId: '',
          selectedOptions: []
        })));
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTest();
  }, [id]);

  // Функція для обробки початку тесту
  const handleStartTest = async () => {
    try {
      setLoading(true);
      
      // Отримуємо версію тесту для проходження (без правильних відповідей)
      const response = await fetch(`http://localhost:5000/api/tests/${id}/start`);
      
      if (!response.ok) {
        throw new Error('Не вдалося почати тест');
      }
      
      const testData = await response.json();
      setTest(testData);
      setCurrentStep('test');
      setCurrentQuestion(0);
      setSelectedOptions([]);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Функція для обробки вибору варіанту відповіді
  const handleOptionSelect = (optionId) => {
    const updatedOptions = [...selectedOptions];
    
    // Перевіряємо, чи опція вже вибрана
    const optionIndex = updatedOptions.indexOf(optionId);
    
    if (optionIndex === -1) {
      // Якщо опції немає у списку вибраних, додаємо її
      updatedOptions.push(optionId);
    } else {
      // Якщо опція вже вибрана, видаляємо її
      updatedOptions.splice(optionIndex, 1);
    }
    
    setSelectedOptions(updatedOptions);
  };

  // Функція для обробки переходу до наступного питання
  const handleNextQuestion = () => {
    // Зберігаємо відповідь на поточне питання
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQuestion] = {
      questionId: test.questions[currentQuestion]._id,
      selectedOptions: [...selectedOptions]
    };
    setUserAnswers(updatedAnswers);
    
    // Якщо це останнє питання, завершуємо тест
    if (currentQuestion === test.questions.length - 1) {
      handleSubmitTest(updatedAnswers);
    } else {
      // Інакше переходимо до наступного питання
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOptions(
        userAnswers[currentQuestion + 1] ? 
        userAnswers[currentQuestion + 1].selectedOptions : []
      );
    }
  };

  // Функція для обробки переходу до попереднього питання
  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      // Зберігаємо відповідь на поточне питання
      const updatedAnswers = [...userAnswers];
      updatedAnswers[currentQuestion] = {
        questionId: test.questions[currentQuestion]._id,
        selectedOptions: [...selectedOptions]
      };
      setUserAnswers(updatedAnswers);
      
      // Переходимо до попереднього питання
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOptions(updatedAnswers[currentQuestion - 1].selectedOptions);
    }
  };

  // Функція для відправки відповідей на сервер і отримання результатів
  const handleSubmitTest = async (finalAnswers) => {
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:5000/api/tests/${id}/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers: finalAnswers })
      });
      
      if (!response.ok) {
        throw new Error('Не вдалося перевірити відповіді');
      }
      
      const resultsData = await response.json();
      setResults(resultsData);
      setCurrentStep('results');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Функція для відображення статусу прогресу
  const renderProgress = () => {
    if (currentStep === 'test') {
      const progress = ((currentQuestion + 1) / test.questions.length) * 100;
      return (
        <div className="progress-container mb-4">
          <div className="d-flex justify-content-between text-muted small mb-1">
            <span>Питання {currentQuestion + 1} з {test.questions.length}</span>
            <span>{Math.round(progress)}% завершено</span>
          </div>
          <ProgressBar now={progress} variant="success" className="progress-bar-thin" />
        </div>
      );
    }
    return null;
  };

  // Рендеринг компонента під час завантаження
  if (loading && currentStep === 'intro') {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="success" />
        <p className="mt-3">Завантаження тесту...</p>
      </Container>
    );
  }

  // Рендеринг компонента при помилці
  if (error) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">
          <Alert.Heading>Помилка завантаження</Alert.Heading>
          <p>{error}</p>
          <div className="d-flex justify-content-center">
            <Button variant="outline-secondary" onClick={() => navigate('/tests')}>
              Повернутися до списку тестів
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  // Рендеринг компонента, якщо тест не знайдено
  if (!test) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">
          <Alert.Heading>Тест не знайдено</Alert.Heading>
          <p>Обраний тест не існує або був видалений.</p>
          <div className="d-flex justify-content-center">
            <Button variant="outline-secondary" onClick={() => navigate('/tests')}>
              Повернутися до списку тестів
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  // Рендеринг вступної сторінки тесту
  if (currentStep === 'intro') {
    return (
      <>
        <div className="test-hero py-5" style={{ minHeight: '75vh' }}>
          <Container>
            <Row className="justify-content-center">
              <Col md={10} lg={8} className="text-center">
                <Link to="/tests" className="btn btn-sm btn-outline-light" style={{ marginRight: '10px' }}>
                  <i className="bi bi-arrow-left"></i> Назад до списку
                </Link>
                <Badge bg="light" className="category-badge mb-3" style={{ color: '#2c7744' }}>
                  {test.category}
                </Badge>
                <h1 className="display-5 fw-bold text-light mb-4">{test.title}</h1>
                <p className="lead text-light mb-4">{test.description}</p>
                
                <Card className="test-info-card mt-4">
                  <Card.Body>
                    <Row>
                      <Col md={4} className="test-info-item">
                        <div className="test-info-icon">
                          <i className="bi bi-question-circle"></i>
                        </div>
                        <div className="test-info-text">
                          <h5>{test.questionCount} питань</h5>
                          <p className="text-muted small">Всього питань</p>
                        </div>
                      </Col>
                      <Col md={4} className="test-info-item">
                        <div className="test-info-icon">
                          <i className="bi bi-clock"></i>
                        </div>
                        <div className="test-info-text">
                          <h5>{test.estimatedTime}</h5>
                          <p className="text-muted small">Орієнтовний час</p>
                        </div>
                      </Col>
                      <Col md={4} className="test-info-item">
                        <div className="test-info-icon">
                          <i className="bi bi-bar-chart"></i>
                        </div>
                        <div className="test-info-text">
                          <h5>{test.difficulty}</h5>
                          <p className="text-muted small">Складність</p>
                        </div>
                      </Col>
                    </Row>
                    <div className="mt-4">
                      <Button 
                        variant="success" 
                        size="lg" 
                        className="px-5" 
                        onClick={handleStartTest}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Завантаження...
                          </>
                        ) : (
                          <>Почати тест</>
                        )}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </>
    );
  }

  // Рендеринг сторінки проходження тесту
  if (currentStep === 'test') {
    const question = test.questions[currentQuestion];
    
    return (
      <div className="test-container py-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={10} lg={8}>
              {renderProgress()}
              
              <Card className="question-card">
                <Card.Body>
                  <Badge bg="light" text="success" className="mb-3">
                    Питання {currentQuestion + 1}
                  </Badge>
                  <Card.Title className="question-text mb-4">{question.text}</Card.Title>
                  {question.options.map((option) => {
                    const isSelected = selectedOptions.includes(option._id);
                    
                    return (
                      <div 
                        key={option._id}
                        className={`custom-option-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleOptionSelect(option._id)}
                      >
                        <div className="custom-checkbox">
                          {isSelected && <i className="bi bi-check-lg"></i>}
                        </div>
                        <div className="custom-option-text">
                          {option.text}
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="d-flex justify-content-between mt-4">
                    <Button 
                      variant="outline-secondary" 
                      onClick={handlePrevQuestion}
                      disabled={currentQuestion === 0}
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Назад
                    </Button>
                    <Button 
                      variant="success" 
                      onClick={handleNextQuestion}
                    >
                      {currentQuestion === test.questions.length - 1 ? (
                        <>Завершити тест</>
                      ) : (
                        <>Далі<i className="bi bi-arrow-right ms-2"></i></>
                      )}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  // Рендеринг сторінки з результатами тесту
  if (currentStep === 'results') {
    return (
      <div className="results-container py-5">
        <Container>
          {/* Додаємо компонент відстеження результатів тесту */}
          <CompletedTestTracker 
            testId={test._id}
            title={test.title}
            category={test.category}
            score={results.score}
            correctAnswers={results.correctAnswers}
            totalQuestions={results.totalQuestions}
          />
          
          <Row className="justify-content-center">
            <Col md={10} lg={8}>
              <Card className="results-card">
                <Card.Body className="text-center p-5">
                  <h2 className="mb-4">Результати тесту</h2>
                  
                  <div className="score-circle mb-4">
                    <div className="score-value">
                      {Math.round(results.score)}%
                    </div>
                  </div>
                  
                  {results.passed ? (
                    <Alert variant="success" className="mb-4">
                      <Alert.Heading>Вітаємо! Ви успішно пройшли тест!</Alert.Heading>
                      <p>Ви відповіли правильно на {results.correctAnswers} з {results.totalQuestions} питань.</p>
                    </Alert>
                  ) : (
                    <Alert variant="warning" className="mb-4">
                      <Alert.Heading>Спробуйте ще раз!</Alert.Heading>
                      <p>Ви відповіли правильно на {results.correctAnswers} з {results.totalQuestions} питань.</p>
                      <p>Для успішного проходження тесту потрібно набрати не менше {test.passingScore}%.</p>
                    </Alert>
                  )}
                  
                  <div className="d-flex justify-content-center mt-4 gap-3">
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => navigate('/tests')}
                    >
                      Повернутися до списку тестів
                    </Button>
                    <Button 
                      variant="success" 
                      onClick={handleStartTest}
                    >
                      Пройти тест ще раз
                    </Button>
                  </div>
                </Card.Body>
              </Card>
              
              <div className="mt-5">
                <h3 className="mb-4">Детальні результати</h3>
                
                {results.details.map((detail, index) => (
                  <Card key={index} className={`mb-3 ${detail.correct ? 'border-success' : 'border-danger'}`}>
                    <Card.Body>
                      <div className="d-flex align-items-center mb-3">
                        <div className={`result-indicator ${detail.correct ? 'correct' : 'incorrect'}`}>
                          <i className={`bi ${detail.correct ? 'bi-check-lg' : 'bi-x-lg'}`}></i>
                        </div>
                        <h5 className="mb-0 ms-3">{detail.questionText}</h5>
                      </div>
                      
                      {detail.explanation && (
                        <div className="explanation-box p-3 mb-3">
                          <h6 className="mb-2">Пояснення:</h6>
                          <p className="mb-0">{detail.explanation}</p>
                        </div>
                      )}
                      
                      <div className="options-list">
                        {test.questions[index].options.map(option => {
                          const isSelected = detail.userSelectedOptions.includes(option._id);
                          const isCorrect = detail.correctOptions.includes(option._id);
                          
                          let optionClass = '';
                          if (isSelected && isCorrect) optionClass = 'correct-selected';
                          else if (isSelected && !isCorrect) optionClass = 'incorrect-selected';
                          else if (!isSelected && isCorrect) optionClass = 'correct-not-selected';
                          
                          return (
                            <div 
                              key={option._id} 
                              className={`option-result ${optionClass}`}
                            >
                              {option.text}
                              {isSelected && (
                                <span className="ms-2">
                                  <i className="bi bi-check-circle-fill text-success"></i>
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  // Якщо жоден з етапів не відповідає поточному стану
  return (
    <Container className="py-5 text-center">
      <p>Щось пішло не так. Спробуйте оновити сторінку.</p>
    </Container>
  );
};

export default TestDetail;