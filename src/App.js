import './App.css';
import React, { useState, useEffect } from "react"; // Добавлен useEffect
import BlockMessages from "./components/messages";
import testimage from "./testimage/306454482_57cad263f13712f6038997319997790e.jpg";
import threedots from "./testimage/free-icon-three-dots-8113272.png";
import leftarrow from "./testimage/free-icon-left-arrow-109618.png";

function App() {
  const [cards, setCards] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);

  // Загружаем сообщения при загрузке страницы
  useEffect(() => {
    loadMessages();
  }, []);

  // Функция загрузки сообщений из базы
  const loadMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/messages');
      if (!response.ok) throw new Error('Ошибка загрузки');
      const data = await response.json();
      
      // Преобразуем данные из БД в формат карточек
      const formattedCards = data.map(item => ({
        text: item.Massage,
        id: item.ID,
        date: formatTime(item.TimeDeploy, item.DateDeploy)
      }));
      
      setCards(formattedCards);
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    } finally {
      setLoading(false);
    }
  };

  // Форматируем время (TimeDeploy) в читаемый формат
  const formatTime = (timeStr, dateStr) => {
    // Если время в формате "HH:MM:SS", берем только часы и минуты
    if (timeStr && typeof timeStr === 'string') {
      return timeStr.substring(0, 5);
    }
    // Или используем текущее время
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Отправка сообщения в базу данных
  const handleSendClick = async () => {
    const textToSend = inputText.trim();
    if (!textToSend) return;

    try {
      const response = await fetch('http://localhost:3000/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: textToSend 
        }),
      });

      if (!response.ok) throw new Error('Ошибка отправки');

      // После успешной отправки обновляем список сообщений
      loadMessages();
      setInputText("");
      
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      // Временное сохранение в стейт при ошибке
      const cardWithDate = {
        text: textToSend,
        id: Date.now(),
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setCards(prev => [...prev, cardWithDate]);
      setInputText("");
    }
  };

  return (
    <div className="App">
      {/* HEADER */}
      <header className="chat-header">
        <div className="header-left">
          <img src={leftarrow} className="icon back" alt="Назад" />
          <img src={testimage} className="avatar" alt="Аватар" />
        </div>
        <div className="header-info">
          <div className="name">Human</div>
          <div className="status">online</div>
        </div>
        <img src={threedots} className="icon menu" alt="Меню" />
      </header>

      {/* BODY */}
      <div className="chat-body">
        {loading ? (
          <div className="loading">Загрузка сообщений...</div>
        ) : (
          <BlockMessages cards={cards} />
        )}
      </div>

      {/* FOOTER */}
      <footer className="chat-footer">
        <div className="footer-inner">
          <input
            type="text"
            className="input-message"
            placeholder="Введите сообщение..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyPress={e => e.key === "Enter" && handleSendClick()}
          />
          <button className="send-button" onClick={handleSendClick}>➤</button>
        </div>
      </footer>
    </div>
  );
}

export default App;