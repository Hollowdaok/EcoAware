import React, { useState } from 'react';
import { Container, Row, Col, Card, Tabs, Tab } from 'react-bootstrap';
import TrashSortingGame from '../components/games/TrashSortingGame';
import Leaderboard from '../components/games/Leaderboard';

const TrashSortingGamePage = () => {
  const [activeTab, setActiveTab] = useState('game');
  
  return (
    <>
      {/* Hero Banner */}
      <div className="bg-success hero-section">
        <Container className="py-5 text-center text-light">
          <h1 className="display-4 mb-3">Сортування сміття</h1>
          <p className="lead mx-auto">
            Навчіться правильно сортувати відходи в інтерактивній грі з різними рівнями складності.
            Дізнайтеся, які матеріали підлягають переробці, а які ні.
          </p>
        </Container>
      </div>

      {/* Tabs Navigation */}
      <Container className="mt-4">
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4"
        >
          <Tab eventKey="game" title="Гра">
            <Row>
              <Col lg={8} className="mb-4">
                <TrashSortingGame />
              </Col>
              
              <Col lg={4}>
                <div className="game-info-sidebar">
                  <Card className="mb-4">
                    <Card.Header as="h5">Про гру</Card.Header>
                    <Card.Body>
                      <p>
                        У цій грі ви навчитеся правильно сортувати різні типи відходів,
                        що є дуже важливою навичкою для збереження навколишнього середовища.
                      </p>
                      <h6>Чому важливо сортувати сміття?</h6>
                      <ul>
                        <li>Переробка зменшує кількість відходів на звалищах</li>
                        <li>Економить природні ресурси</li>
                        <li>Зменшує забруднення повітря і води</li>
                        <li>Економить енергію</li>
                      </ul>
                    </Card.Body>
                  </Card>
                  
                </div>
              </Col>
            </Row>
          </Tab>
          
          <Tab eventKey="leaderboard" title="Таблиця рекордів">
            <Leaderboard />
          </Tab>
          
          <Tab eventKey="rules" title="Як грати">
            <div className="game-rules-container p-4 bg-white rounded shadow-sm">
              <h2 className="mb-4">Правила гри "Сортування сміття"</h2>
              
              <div className="rule-section mb-4">
                <h4>Ціль гри</h4>
                <p>Правильно відсортувати якомога більше предметів до відповідних контейнерів за відведений час.</p>
              </div>
              
              <div className="rule-section mb-4">
                <h4>Як грати</h4>
                <ol>
                  <li>Перетягніть предмет сміття до відповідного контейнера.</li>
                  <li>За кожне правильне сортування ви отримуєте очки.</li>
                  <li>За неправильне сортування очки не нараховуються.</li>
                  <li>Гра закінчується, коли закінчується час або закінчуються предмети.</li>
                </ol>
              </div>
              
              <div className="rule-section mb-4">
                <h4>Категорії сортування</h4>
                <ul>
                  <li><strong>Папір</strong> - газети, журнали, картонні коробки, паперові пакети</li>
                  <li><strong>Пластик</strong> - пластикові пляшки, контейнери, упаковки</li>
                  <li><strong>Скло</strong> - скляні пляшки, банки</li>
                  <li><strong>Метал</strong> - алюмінієві банки, консервні банки</li>
                  <li><strong>Органіка</strong> - харчові відходи, рослинні залишки</li>
                  <li><strong>Змішані</strong> - відходи, які не підлягають переробці</li>
                </ul>
              </div>
              
              <div className="rule-section">
                <h4>Поради</h4>
                <ul>
                  <li>Зверніть увагу на опис предмета, щоб визначити його тип.</li>
                  <li>На вищих рівнях складності у вас буде менше часу, тому дійте швидко!</li>
                  <li>Пам'ятайте, що деякі предмети можуть бути неочевидними - наприклад, деякі типи пластику не переробляються.</li>
                </ul>
              </div>
            </div>
          </Tab>
        </Tabs>
      </Container>
    </>
  );
};

export default TrashSortingGamePage;