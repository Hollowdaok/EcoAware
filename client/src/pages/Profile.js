import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Nav, Tab, Badge, Alert, Spinner, Button, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// API URL - constant defined outside component
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Profile = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use useRef to store mutable values that don't cause re-renders
  const userStatsRef = useRef({
    articles: [],
    tests: [],
    gameResults: []
  });
  
  // State for user profile data
  const [userStats, setUserStats] = useState({
    articles: [],
    tests: [],
    gameResults: []
  });
  
  // Loading user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        
        // Array to store error messages to display to the user
        const errorMessages = [];
        
        // 1. Get viewed articles via direct access
        try {
          const articlesViewedResponse = await fetch(`${API_URL}/articles/viewed`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
          if (articlesViewedResponse.ok) {
            const articlesData = await articlesViewedResponse.json();
            
            if (articlesData.success) {
              userStatsRef.current.articles = articlesData.articles || [];
            } else {
              errorMessages.push(`Помилка отримання статей: ${articlesData.message || 'Невідома помилка'}`);
            }
          } else {
            const errorText = await articlesViewedResponse.text();
            console.error('Error fetching articles via direct access:', articlesViewedResponse.status, errorText);
            errorMessages.push(`Помилка отримання статей (${articlesViewedResponse.status})`);
            
            // If direct access doesn't work, try the regular route
            const fallbackResponse = await fetch(`${API_URL}/articles/viewed`, {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            });
            
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              if (fallbackData.success) {
                userStatsRef.current.articles = fallbackData.articles || [];
              }
            }
          }
        } catch (articlesError) {
          console.error('Exception fetching articles:', articlesError);
          errorMessages.push(`Помилка отримання статей: ${articlesError.message}`);
        }
        
        // 2. Get completed tests via direct access
        try {
          const testsCompletedResponse = await fetch(`${API_URL}/tests/completed`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
          if (testsCompletedResponse.ok) {
            const testsData = await testsCompletedResponse.json();
            
            if (testsData.success) {
              userStatsRef.current.tests = testsData.tests || [];
            } else {
              errorMessages.push(`Помилка отримання тестів: ${testsData.message || 'Невідома помилка'}`);
            }
          } else {
            const errorText = await testsCompletedResponse.text();
            console.error('Error fetching tests via direct access:', testsCompletedResponse.status, errorText);
            errorMessages.push(`Помилка отримання тестів (${testsCompletedResponse.status})`);
            
            // If direct access doesn't work, try the regular route
            const fallbackResponse = await fetch(`${API_URL}/tests/completed`, {
              method: 'GET',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            });
            
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              if (fallbackData.success) {
                userStatsRef.current.tests = fallbackData.tests || [];
              }
            }
          }
        } catch (testsError) {
          console.error('Exception fetching tests:', testsError);
          errorMessages.push(`Помилка отримання тестів: ${testsError.message}`);
        }
        
        // 3. Get game results
        try {
          
          // Using standard headers without X-User-ID
          const gameResultsResponse = await fetch(`${API_URL}/games/trash-sorting/stats`, {
            method: 'GET',
            credentials: 'include', // Important for cookie transmission
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });
          
          if (gameResultsResponse.ok) {
            const gameResultsData = await gameResultsResponse.json();
            
            if (gameResultsData.success) {
              userStatsRef.current.gameResults = gameResultsData.stats || [];
            } else {
              console.error('Error in game results data:', gameResultsData.message);
              // Create empty stats
              userStatsRef.current.gameResults = {
                totalGames: 0,
                totalScore: 0,
                correctIncorrect: { correct: 0, incorrect: 0, total: 0, accuracy: 0 },
                levelStats: []
              };
            }
          } else {
            // Create empty stats
            userStatsRef.current.gameResults = {
              totalGames: 0,
              totalScore: 0,
              correctIncorrect: { correct: 0, incorrect: 0, total: 0, accuracy: 0 },
              levelStats: []
            };
          }
        } catch (gameError) {
          console.error('Exception fetching game results:', gameError);
          // Create empty stats
          userStatsRef.current.gameResults = {
            totalGames: 0,
            totalScore: 0,
            correctIncorrect: { correct: 0, incorrect: 0, total: 0, accuracy: 0 },
            levelStats: []
          };
        }
        
        // Update component state with received data
        setUserStats({
          articles: userStatsRef.current.articles,
          tests: userStatsRef.current.tests,
          gameResults: userStatsRef.current.gameResults
        });
        
        // If there are errors, set them for display
        if (errorMessages.length > 0) {
          setError(errorMessages.join('. '));
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Не вдалося завантажити дані. Спробуйте пізніше.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [isAuthenticated]); // API_URL removed as it's a constant outside component
  
  // Date formatting
  const formatDate = (dateString) => {
    if (!dateString) return 'Дата невідома';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // If user is not authenticated
  if (!isAuthenticated) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <Alert.Heading>Необхідна авторизація</Alert.Heading>
          <p>Для доступу до особистого кабінету необхідно авторизуватись.</p>
          <div className="d-flex justify-content-end">
            <Button as={Link} to="/login" variant="outline-success" className="me-2">
              Увійти
            </Button>
            <Button as={Link} to="/register" variant="success">
              Зареєструватися
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container className="py-5">
      <h1 className="mb-4">Особистий кабінет</h1>
      
      {/* User information */}
      <Card className="mb-4">
        <Card.Header as="h5" className="bg-success text-white">
          Профіль користувача
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3} className="text-center mb-3 mb-md-0">
              <div className="avatar-container">
                <div className="avatar bg-light-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: '120px', height: '120px', margin: '0 auto' }}>
                  <span className="display-6 text-success">{currentUser?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
                </div>
              </div>
            </Col>
            <Col md={9}>
              <h4>{currentUser?.username}</h4>
              <p className="text-muted mb-2">{currentUser?.email}</p>
              
              <div className="user-stats mt-3">
                <Badge bg="success" className="me-2 p-2">
                  {userStats.gameResults?.totalGames || 0} ігор зіграно
                </Badge>
                <Badge bg="info" className="me-2 p-2">
                  {userStats.tests?.length || 0} тестів пройдено
                </Badge>
                <Badge bg="primary" className="p-2">
                  {userStats.articles?.length || 0} статей прочитано
                </Badge>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* User data tabs */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
          <p className="mt-3">Завантаження даних...</p>
        </div>
      ) : error ? (
        <Alert variant="warning">
          <Alert.Heading>Увага</Alert.Heading>
          <p>{error}</p>
          <p className="mb-0">Спробуйте оновити сторінку або перейти до інших розділів.</p>
        </Alert>
      ) : (
        <Tab.Container id="profile-tabs" defaultActiveKey="articles">
          <Row>
            <Col md={3} className="mb-4">
            <Nav variant="pills" className="flex-column">
              <Nav.Item>
                <Nav.Link eventKey="articles">
                  Переглянуті статті 
                  {userStats.articles?.length > 0 && (
                    <Badge bg="light" text="dark" className="ms-2">
                      {userStats.articles.length}
                    </Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="tests">
                  Пройдені тести 
                  {userStats.tests?.length > 0 && (
                    <Badge bg="light" text="dark" className="ms-2">
                      {userStats.tests.length}
                    </Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="games">
                  Результати ігор
                </Nav.Link>
              </Nav.Item>
            </Nav>
            </Col>
            <Col md={9}>
              <Tab.Content>
                {/* Viewed articles */}
                <Tab.Pane eventKey="articles">
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0">Переглянуті статті</h5>
                    </Card.Header>
                    <Card.Body>
                      {userStats.articles && userStats.articles.length > 0 ? (
                        <div>
                          <Row>
                            {userStats.articles.map((article, index) => (
                              <Col md={6} key={index} className="mb-3">
                                <Card className="h-100">
                                  <Card.Body>
                                    <Badge bg="light" text="dark" className="mb-2">
                                      {article.category}
                                    </Badge>
                                    <Card.Title>{article.title}</Card.Title>
                                    <Card.Text className="small text-muted">
                                      Переглядів: {article.viewCount || 1}<br />
                                      Останній перегляд: {formatDate(article.lastViewedAt || article.firstViewedAt)}
                                    </Card.Text>
                                    <Button 
                                      as={Link} 
                                      to={`/knowledge/article/${article.articleId}`}
                                      variant="outline-success"
                                      size="sm"
                                    >
                                      Читати знову
                                    </Button>
                                  </Card.Body>
                                </Card>
                              </Col>
                            ))}
                          </Row>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="mb-3">Ви ще не переглядали жодної статті.</p>
                          <Button as={Link} to="/knowledge" variant="success">
                            Перейти до статей
                          </Button>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Tab.Pane>
                
                {/* Completed tests */}
                <Tab.Pane eventKey="tests">
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0">Пройдені тести</h5>
                    </Card.Header>
                    <Card.Body>
                      {userStats.tests && userStats.tests.length > 0 ? (
                        <div>
                          <Table striped bordered hover responsive>
                            <thead>
                              <tr>
                                <th>Назва тесту</th>
                                <th>Категорія</th>
                                <th>Результат</th>
                                <th>Дата проходження</th>
                                <th>Дії</th>
                              </tr>
                            </thead>
                            <tbody>
                              {userStats.tests.map((test, index) => (
                                <tr key={index}>
                                  <td>{test.title}</td>
                                  <td>
                                    <Badge bg="light" text="dark">{test.category}</Badge>
                                  </td>
                                  <td>
                                    <Badge bg={test.score >= 80 ? 'success' : test.score >= 60 ? 'warning' : 'danger'}>
                                      {test.score}%
                                    </Badge>
                                  </td>
                                  <td>{formatDate(test.completedAt)}</td>
                                  <td>
                                    <Button 
                                      as={Link} 
                                      to={`/tests/${test.testId}`} 
                                      variant="outline-primary" 
                                      size="sm"
                                    >
                                      Пройти знову
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="mb-3">Ви ще не проходили жодного тесту.</p>
                          <Button as={Link} to="/tests" variant="success">
                            Перейти до тестів
                          </Button>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Tab.Pane>
                
                {/* Game results */}
                <Tab.Pane eventKey="games">
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0">Результати гри "Сортування сміття"</h5>
                    </Card.Header>
                    <Card.Body>
                      {userStats.gameResults && userStats.gameResults.totalGames > 0 ? (
                        <div>
                          <div className="stats-summary mb-4">
                            <Row>
                              <Col md={4} className="mb-3">
                                <div className="stats-card bg-light p-3 rounded text-center">
                                  <h2 className="text-success">{userStats.gameResults.totalGames || 0}</h2>
                                  <p className="text-muted mb-0">Всього зіграних ігор</p>
                                </div>
                              </Col>
                              <Col md={4} className="mb-3">
                                <div className="stats-card bg-light p-3 rounded text-center">
                                  <h2 className="text-success">{userStats.gameResults.totalScore || 0}</h2>
                                  <p className="text-muted mb-0">Загальна кількість очок</p>
                                </div>
                              </Col>
                              <Col md={4} className="mb-3">
                                <div className="stats-card bg-light p-3 rounded text-center">
                                  <h2 className="text-success">
                                    {userStats.gameResults.correctIncorrect?.accuracy || 0}%
                                  </h2>
                                  <p className="text-muted mb-0">Загальна точність</p>
                                </div>
                              </Col>
                            </Row>
                          </div>
                          
                          <h6>Результати за рівнями:</h6>
                          {userStats.gameResults.levelStats && userStats.gameResults.levelStats.length > 0 ? (
                            <Table striped bordered hover responsive className="mt-3">
                              <thead>
                                <tr>
                                  <th>Рівень</th>
                                  <th>Зіграно ігор</th>
                                  <th>Середній рахунок</th>
                                  <th>Максимальний рахунок</th>
                                  <th>Середній час гри</th>
                                </tr>
                              </thead>
                              <tbody>
                                {userStats.gameResults.levelStats.map((level, index) => (
                                  <tr key={index}>
                                    <td>
                                      {level.level === 1 ? 'Легкий' : 
                                      level.level === 2 ? 'Середній' : 'Складний'}
                                    </td>
                                    <td>{level.gamesPlayed}</td>
                                    <td>{level.avgScore}</td>
                                    <td>{level.maxScore}</td>
                                    <td>{Math.floor(level.avgPlayTime / 60)}:{(level.avgPlayTime % 60).toString().padStart(2, '0')}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          ) : (
                            <p className="text-muted">Детальна статистика по рівнях недоступна.</p>
                          )}
                          
                          <div className="text-center mt-4">
                            <Button as={Link} to="/games/trash-sorting" variant="success">
                              Грати зараз
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="mb-3">Ви ще не грали в гру "Сортування сміття".</p>
                          <Button as={Link} to="/games/trash-sorting" variant="success">
                            Зіграти зараз
                          </Button>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      )}
    </Container>
  );
};

export default Profile;