import React, { useState } from 'react';
import { Kanban, Plus, ArrowRight, ArrowLeft } from 'lucide-react';
import GmailSyncButton from './GmailSyncButton';
import KanbanSkeletonCard from './KanbanSkeletonCard';
import CalendarPage from './CalendarPage';

export default function TrackerPage({
  applications,
  appliedApps,
  interviewingApps,
  offerApps,
  totalAppsCount,
  successRate,
  progressPercent,
  gmailToken,
  currentUser,
  gmailSyncing,
  setApplications,
  setGmailToken,
  setGmailSyncing,
  setShowAddModal,
  showAddModal,
  newCompany,
  setNewCompany,
  newRole,
  setNewRole,
  newPriority,
  setNewPriority,
  newStatus,
  setNewStatus,
  handleAddApplication,
  handleDragOver,
  handleDrop,
  handleDragStart,
  handleMoveItem,
  getTagClass,
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
  const [selectedApp, setSelectedApp] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editCompany, setEditCompany] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editPriority, setEditPriority] = useState('High Priority');
  const [editStatus, setEditStatus] = useState('applied');

  const handleOpenDetailsModal = (app) => {
    setSelectedApp(app);
    setEditCompany(app.company || '');
    setEditRole(app.role || '');
    setEditPriority(app.priority || 'Medium');
    setEditStatus(app.status || 'applied');
    setIsDetailsModalOpen(true);
  };

  const handleSaveDetails = (e) => {
    if (e) e.preventDefault();
    if (!editCompany.trim()) {
      alert("Company name cannot be empty.");
      return;
    }
    setApplications(prev => prev.map(app => {
      if (app.id === selectedApp.id) {
        const extraFields = {};
        if (editStatus === 'applied' && app.status !== 'applied') {
          extraFields.appliedDate = new Date().toISOString().split('T')[0];
          extraFields.followUp3Done = false;
          extraFields.followUp7Done = false;
        } else if ((editStatus === 'interviewing' || editStatus === 'offer') && app.status === 'applied') {
          extraFields.responseDate = new Date().toISOString().split('T')[0];
        }
        return {
          ...app,
          company: editCompany.trim(),
          role: editRole.trim(),
          priority: editStatus === 'offer' ? 'Active Offer' : editPriority,
          status: editStatus,
          logoLetter: editCompany.trim().charAt(0).toUpperCase(),
          ...extraFields
        };
      }
      return app;
    }));
    setIsDetailsModalOpen(false);
    setSelectedApp(null);
  };

  const handleDeleteApp = () => {
    if (window.confirm(`Are you sure you want to delete your application for ${selectedApp.company}?`)) {
      setApplications(prev => prev.filter(app => app.id !== selectedApp.id));
      setIsDetailsModalOpen(false);
      setSelectedApp(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="tracker-page-container" style={{ padding: '40px 20px', maxWidth: '1400px', margin: '80px auto 40px auto' }}>
      <div className="dashboard-card card-double-width" id="tracker-section" style={{ width: '100%' }}>
        <div className="card-border-glow"></div>
        <div className="card-header">
          <div className="card-header-left">
            <div className="card-icon-container status-cyan">
              <Kanban size={20} />
            </div>
            <div>
              <h3 className="card-title">Manage Internship Dashboard</h3>
              <p className="card-subtitle">Manage, categorize, and track application lifecycles (Double-click card to edit or view Gmail sync)</p>
            </div>
          </div>
          <div className="card-header-right" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <GmailSyncButton 
              accessToken={gmailToken} 
              userId={currentUser?.uid || 'guest-evaluator'} 
              setApplications={setApplications} 
              setGmailToken={setGmailToken}
              currentUser={currentUser}
              syncing={gmailSyncing}
              setSyncing={setGmailSyncing}
            />
            <button 
              className="btn btn-action" 
              id="btn-add-application" 
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={14} /> Add App
            </button>
          </div>
        </div>
        
        <div className="card-body">
          <div className="tracker-progress-summary">
            <div className="progress-info">
              <span className="progress-label">Total Applications: <strong>{totalAppsCount}</strong></span>
              <span className="progress-percentage">Success rate: <strong>{successRate}%</strong></span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          <div className="kanban-board">
            {/* Column: Applied */}
            <div 
              className="kanban-column" 
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'applied')}
            >
              <div className="column-header">
                <span className="column-title"><span className="status-dot dot-purple"></span> Applied</span>
                <span className="column-badge">{appliedApps.length}</span>
              </div>
              <div className="kanban-cards-container">
                {appliedApps.map(app => (
                  <div 
                    className={`kanban-item ${app.animateTrigger ? "anti-gravity-floating" : ""}`} 
                    key={app.id} 
                    id={app.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, app.id)}
                    onDoubleClick={() => handleOpenDetailsModal(app)}
                    style={{ cursor: 'pointer' }}
                    title="Double-click to view email details & edit"
                  >
                    <div className="item-meta">
                      <div 
                        className={`company-logo ${app.logoClass || ''}`}
                        style={app.customBg ? { background: app.customBg } : {}}
                      >
                        {app.logoLetter}
                      </div>
                      <div className="item-details">
                        <span className="item-role">
                          {app.role || <span style={{ opacity: 0.5, fontStyle: 'italic', fontSize: '11.5px' }}>Double-click to set role</span>}
                        </span>
                        <span className="item-company">{app.company}</span>
                        {app.appliedDate && (
                          <span className="item-date" style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.45)', marginTop: '4px', display: 'block' }}>
                            Applied: {formatDate(app.appliedDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="item-footer">
                      <span className={`item-tag ${getTagClass(app.priority)}`}>{app.priority}</span>
                      <div className="item-actions">
                        <button 
                          className="btn-item-arrow" 
                          onClick={() => handleMoveItem(app.id, 'interviewing')}
                          title="Move to Interviewing"
                        >
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {gmailSyncing && <KanbanSkeletonCard />}
              </div>
            </div>

            {/* Column: Interviewing */}
            <div 
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'interviewing')}
            >
              <div className="column-header">
                <span className="column-title"><span className="status-dot dot-blue"></span> Interviewing</span>
                <span className="column-badge">{interviewingApps.length}</span>
              </div>
              <div className="kanban-cards-container">
                {interviewingApps.map(app => (
                  <div 
                    className={`kanban-item ${app.animateTrigger ? "anti-gravity-floating" : ""}`} 
                    key={app.id}
                    id={app.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, app.id)}
                    onDoubleClick={() => handleOpenDetailsModal(app)}
                    style={{ cursor: 'pointer' }}
                    title="Double-click to view email details & edit"
                  >
                    <div className="item-meta">
                      <div 
                        className={`company-logo ${app.logoClass || ''}`}
                        style={app.customBg ? { background: app.customBg } : {}}
                      >
                        {app.logoLetter}
                      </div>
                      <div className="item-details">
                        <span className="item-role">
                          {app.role || <span style={{ opacity: 0.5, fontStyle: 'italic', fontSize: '11.5px' }}>Double-click to set role</span>}
                        </span>
                        <span className="item-company">{app.company}</span>
                        {app.responseDate ? (
                          <span className="item-date" style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.45)', marginTop: '4px', display: 'block' }}>
                            Response: {formatDate(app.responseDate)}
                          </span>
                        ) : app.appliedDate ? (
                          <span className="item-date" style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.45)', marginTop: '4px', display: 'block' }}>
                            Applied: {formatDate(app.appliedDate)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="item-footer">
                      <span className={`item-tag ${getTagClass(app.priority)}`}>{app.priority}</span>
                      <div className="item-actions">
                        <button 
                          className="btn-item-arrow arrow-back" 
                          onClick={() => handleMoveItem(app.id, 'applied')}
                          title="Move back to Applied"
                          style={{ marginRight: '4px' }}
                        >
                          <ArrowLeft size={12} />
                        </button>
                        <button 
                          className="btn-item-arrow" 
                          onClick={() => handleMoveItem(app.id, 'offer')}
                          title="Move to Offer"
                        >
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {gmailSyncing && <KanbanSkeletonCard />}
              </div>
            </div>

            {/* Column: Offer */}
            <div 
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'offer')}
            >
              <div className="column-header">
                <span className="column-title"><span className="status-dot dot-cyan"></span> Offer Received</span>
                <span className="column-badge">{offerApps.length}</span>
              </div>
              <div className="kanban-cards-container">
                {offerApps.map(app => (
                  <div 
                    className={`kanban-item offer-border-pulse ${app.animateTrigger ? "anti-gravity-floating" : ""}`} 
                    key={app.id}
                    id={app.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, app.id)}
                    onDoubleClick={() => handleOpenDetailsModal(app)}
                    style={{ cursor: 'pointer' }}
                    title="Double-click to view email details & edit"
                  >
                    <div className="item-meta">
                      <div 
                        className={`company-logo ${app.logoClass || ''}`}
                        style={app.customBg ? { background: app.customBg } : {}}
                      >
                        {app.logoLetter}
                      </div>
                      <div className="item-details">
                        <span className="item-role">
                          {app.role || <span style={{ opacity: 0.5, fontStyle: 'italic', fontSize: '11.5px' }}>Double-click to set role</span>}
                        </span>
                        <span className="item-company">{app.company}</span>
                        {app.responseDate ? (
                          <span className="item-date" style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.45)', marginTop: '4px', display: 'block' }}>
                            Offer: {formatDate(app.responseDate)}
                          </span>
                        ) : app.appliedDate ? (
                          <span className="item-date" style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.45)', marginTop: '4px', display: 'block' }}>
                            Applied: {formatDate(app.appliedDate)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="item-footer">
                      <span className={`item-tag ${getTagClass(app.priority)}`}>{app.priority}</span>
                      <div className="item-actions">
                        <button 
                          className="btn-item-arrow arrow-back" 
                          onClick={() => handleMoveItem(app.id, 'interviewing')}
                          title="Move back to Interviewing"
                        >
                          <ArrowLeft size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {gmailSyncing && <KanbanSkeletonCard />}
              </div>
            </div>
          </div>
        </div>

        {/* Kanban Card Add Modal */}
        <div className={`application-modal-overlay ${showAddModal ? 'active' : ''}`}>
          <div className="application-modal">
            <div className="modal-header">
              <h3>Add Internship Application</h3>
              <button className="btn-close" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddApplication}>
                <div className="form-group">
                  <label htmlFor="form-company">Company Name</label>
                  <input 
                    type="text" 
                    id="form-company" 
                    required 
                    placeholder="e.g. Microsoft"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="form-role">Internship Role</label>
                  <input 
                    type="text" 
                    id="form-role" 
                    required 
                    placeholder="e.g. Software Engineer Intern"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="form-priority">Priority / Urgency</label>
                  <select 
                    id="form-priority"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                  >
                    <option value="High Priority">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low Priority">Low Priority</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="form-status">Initial Status</label>
                  <select 
                    id="form-status"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offer">Offer</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '10px' }}>
                  Create Application
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Kanban Card Details / Edit Modal */}
        <div className={`application-modal-overlay ${isDetailsModalOpen ? 'active' : ''}`}>
          <div className="application-modal" style={{ maxWidth: '500px', width: '95%' }}>
            <div className="modal-header">
              <h3>Edit Internship Application</h3>
              <button className="btn-close" onClick={() => { setIsDetailsModalOpen(false); setSelectedApp(null); }}>&times;</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSaveDetails}>
                <div className="form-group">
                  <label htmlFor="edit-form-company">Company Name</label>
                  <input 
                    type="text" 
                    id="edit-form-company" 
                    required 
                    value={editCompany}
                    onChange={(e) => setEditCompany(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-form-role">Internship Role</label>
                  <input 
                    type="text" 
                    id="edit-form-role" 
                    placeholder="e.g. Software Engineer Intern"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-form-priority">Priority / Urgency</label>
                  <select 
                    id="edit-form-priority"
                    disabled={editStatus === 'offer'}
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                  >
                    <option value="High Priority">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low Priority">Low Priority</option>
                    <option value="Technical Round">Technical Round</option>
                    <option value="Behavioral Round">Behavioral Round</option>
                    <option value="Active Offer">Active Offer</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="edit-form-status">Status</label>
                  <select 
                    id="edit-form-status"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="applied">Applied</option>
                    <option value="interviewing">Interviewing</option>
                    <option value="offer">Offer</option>
                  </select>
                </div>

                {selectedApp?.emailSubject && (
                  <div className="gmail-sync-details" style={{
                    marginTop: '20px',
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px dashed rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    maxHeight: '220px',
                    overflowY: 'auto'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#00ff87', letterSpacing: '1px', fontWeight: 'bold' }}>
                        ⚡ Synced Gmail Content
                      </span>
                      <span style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.45)' }}>
                        {selectedApp.emailDate || ''}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#f1f5f9', marginBottom: '8px' }}>
                      <strong>Subject:</strong> {selectedApp.emailSubject}
                    </div>
                    <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.45', background: 'rgba(0,0,0,0.25)', padding: '12px', borderRadius: '6px', whiteSpace: 'pre-wrap' }}>
                      {selectedApp.emailSnippet}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                    Save Changes
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-action" 
                    onClick={handleDeleteApp}
                    style={{ 
                      flex: 1, 
                      background: 'rgba(244, 63, 94, 0.15)', 
                      border: '1px solid rgba(244, 63, 94, 0.3)', 
                      color: '#f43f5e' 
                    }}
                  >
                    Delete Card
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <CalendarPage
        selectedDay={selectedDay}
        setSelectedDay={setSelectedDay}
        remainingTasksCount={remainingTasksCount}
        daysInJune={daysInJune}
        agendaDatabase={agendaDatabase}
        currentTasks={currentTasks}
        handleToggleTask={handleToggleTask}
        quickTaskText={quickTaskText}
        setQuickTaskText={setQuickTaskText}
        handleQuickAddTask={handleQuickAddTask}
        isEmbedded={true}
      />
    </div>
  );
}
