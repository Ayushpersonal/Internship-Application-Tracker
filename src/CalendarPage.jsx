import React from 'react';
import { Calendar as CalendarIcon, Clock, Plus, Info } from 'lucide-react';

export default function CalendarPage({
  selectedDay,
  setSelectedDay,
  remainingTasksCount,
  daysInJune,
  agendaDatabase,
  currentTasks,
  handleToggleTask,
  quickTaskText,
  setQuickTaskText,
  handleQuickAddTask
}) {
  return (
    <div className="calendar-page-container" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '80px auto 40px auto' }}>
      <div className="dashboard-card card-double-width" id="calendar-section" style={{ width: '100%' }}>
        <div className="card-border-glow"></div>
        <div className="card-header">
          <div className="card-header-left">
            <div className="card-icon-container status-gold">
              <CalendarIcon size={20} />
            </div>
            <div>
              <h3 className="card-title">Interview Calendar & Checklist</h3>
              <p className="card-subtitle">Keep track of technical assessments, HR follow-ups, and schedules</p>
            </div>
          </div>
          <div className="card-header-right">
            <span className="calendar-month-indicator" id="current-month-year">June 2026</span>
          </div>
        </div>
        
        <div className="card-body">
          <div className="calendar-split-container">
            <div className="calendar-left-pane">
              <div className="calendar-weekdays">
                <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
              </div>
              <div className="calendar-days">
                {daysInJune.map((d, index) => {
                  const isToday = !d.isPrev && d.day === 2;
                  const isSelected = !d.isPrev && d.day === selectedDay;
                  const hasEvent = !d.isPrev && agendaDatabase[d.day];
                  
                  let dayClass = 'calendar-day';
                  if (d.isPrev) dayClass += ' prev-next-month';
                  if (isToday) dayClass += ' today';
                  if (isSelected) dayClass += ' selected';

                  let dotColorClass = '';
                  if (hasEvent) {
                    dotColorClass = (d.day === 2 || d.day === 12 || d.day === 22) ? 'dot-red' : 'dot-yellow';
                  }

                  return (
                    <div 
                      className={dayClass} 
                      key={index}
                      onClick={() => {
                        if (!d.isPrev) setSelectedDay(d.day);
                      }}
                    >
                      {d.day}
                      {hasEvent && <span className={`day-event-dot ${dotColorClass}`}></span>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="agenda-right-pane">
              <div className="agenda-header">
                <span className="agenda-date" id="selected-agenda-date">
                  {selectedDay === 2 ? 'Today - ' : ''}June {selectedDay}, 2026
                </span>
                <span className="agenda-count" id="active-tasks-count">
                  {remainingTasksCount} Remaining
                </span>
              </div>
              
              <div className="agenda-list">
                {currentTasks.length === 0 ? (
                  <div className="empty-agenda">
                    <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '12px', padding: '24px 0' }}>
                      <Info size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> 
                      No interviews scheduled. Keep building!
                    </p>
                  </div>
                ) : (
                  currentTasks.map((task, index) => (
                    <div className="agenda-task-item" key={index}>
                      <label className="checkbox-container">
                        <input 
                          type="checkbox" 
                          checked={task.done} 
                          onChange={() => handleToggleTask(index)}
                        />
                        <span className="checkmark"></span>
                        <div className="task-info">
                          <span className={`task-title ${task.done ? 'strike' : ''}`}>
                            {task.title}
                          </span>
                          <span className="task-time">
                            <Clock size={10} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> 
                            {task.time}
                          </span>
                        </div>
                      </label>
                    </div>
                  ))
                )}
              </div>

              <div className="quick-add-task-container">
                <input 
                  type="text" 
                  id="quick-task-input" 
                  placeholder="Add custom agenda item..."
                  value={quickTaskText}
                  onChange={(e) => setQuickTaskText(e.target.value)}
                  onKeyDown={handleQuickAddTask}
                />
                <button 
                  className="btn btn-action" 
                  id="btn-quick-add-task"
                  onClick={() => handleQuickAddTask({})}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
