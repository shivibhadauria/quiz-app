import React, { useState, useEffect } from 'react';
import questionsData from './questions.json';
import './Quiz.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';

const Quiz = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timer, setTimer] = useState(600); // 10 minutes in seconds
  const [fullScreen, setFullScreen] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const savedState = JSON.parse(localStorage.getItem('quizState'));
    if (savedState) {
      setCurrentQuestionIndex(savedState.currentQuestionIndex);
      setTimer(savedState.timer);
      setAnswers(savedState.answers || []);
    }

    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 0) {
          clearInterval(interval);
          setCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timer <= 0) {
      setCompleted(true);
    }
  }, [timer]);

  useEffect(() => {
    localStorage.setItem('quizState', JSON.stringify({ currentQuestionIndex, timer, answers }));
  }, [currentQuestionIndex, timer, answers]);

  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };

  const handleNextQuestion = () => {
    const answer = selectedOption || "Not Attempted";
    setAnswers(prevAnswers => [
      ...prevAnswers,
      { questionIndex: currentQuestionIndex, answer, correctAnswer: questionsData[currentQuestionIndex].correctAnswer }
    ]);
    setSelectedOption(null);
    if (currentQuestionIndex + 1 < questionsData.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleSkipQuestion = () => {
    setAnswers(prevAnswers => [
      ...prevAnswers,
      { questionIndex: currentQuestionIndex, answer: "Not Attempted", correctAnswer: questionsData[currentQuestionIndex].correctAnswer }
    ]);
    setSelectedOption(null);
    if (currentQuestionIndex + 1 < questionsData.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleFullScreenChange = () => {
    if (document.fullscreenElement) {
      setFullScreen(true);
    } else {
      setFullScreen(false);
    }
  };

  const handleFullScreenToggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  const calculateScore = () => {
    return answers.reduce((score, answer) => {
      if (answer.answer === answer.correctAnswer) {
        return score + 1;
      }
      return score;
    }, 0);
  };

  if (!fullScreen) {
    return (
      <div className="quiz-container">
        <p>Please enable full screen to start the quiz.</p>
        <button onClick={handleFullScreenToggle}>Enable Full Screen</button>
      </div>
    );
  }

  if (completed) {
    const score = calculateScore();
    return (
      <div className="quiz-container">
        <h1>Thank you! You have successfully completed the quiz.</h1>
        <div className="result-box">
          <div className="score">Your score: {score} out of {questionsData.length}</div>
          <h2>SCORE CARD</h2>
          <table className="result-table">
            <thead>
              <tr>
                <th>Question No.</th>
                <th>Your Answer</th>
                <th>Correct Answer</th>
              </tr>
            </thead>
            <tbody>
              {answers.map((answer, index) => (
                <tr key={index}>
                  <td>{answer.questionIndex + 1}</td>
                  <td className={`${answer.answer === answer.correctAnswer ? 'correct-answer' : (answer.answer === "Not Attempted" ? 'not-attempted' : 'incorrect-answer')}`}>
                    {answer.answer === "Not Attempted" ? "Not Attempted" : `Your answer: ${answer.answer}`}
                  </td>
                  <td className="correct-answer">{answer.correctAnswer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <h1 className="quiz-heading">Quiz</h1>
      <div className="timer-container">
        <div className="timer-box">
          <FontAwesomeIcon icon={faClock} className="timer-icon" />
          <span className="timer">
            Time left: {Math.floor(timer / 60)}:{('0' + timer % 60).slice(-2)}
          </span>
        </div>
      </div>
      <div className="quiz-box">
        <div className="quiz-question">
          <p>{questionsData[currentQuestionIndex].question}</p>
        </div>
        {questionsData[currentQuestionIndex].options.map(option => (
          <div key={option} className="quiz-option">
            <input
              type="radio"
              id={option}
              name="option"
              value={option}
              checked={selectedOption === option}
              onChange={() => handleOptionChange(option)}
            />
            <label htmlFor={option}>{option}</label>
          </div>
        ))}
        {currentQuestionIndex + 1 < questionsData.length ? (
          <div>
            <button onClick={handleNextQuestion}>Save & Next</button>
            <button onClick={handleSkipQuestion} style={{ marginLeft: '10px' }}>Skip</button>
          </div>
        ) : (
          <button onClick={handleNextQuestion}>Submit</button>
        )}
      </div>
    </div>
  );
};

export default Quiz;
