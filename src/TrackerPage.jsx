import React from 'react';
import { Kanban, Plus, ArrowRight, ArrowLeft } from 'lucide-react';
import GmailSyncButton from './GmailSyncButton';
import KanbanSkeletonCard from './KanbanSkeletonCard';

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
  getTagClass
}) {
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
              <p className="card-subtitle">Manage, categorize, and track application lifecycles</p>
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
                  >
                    <div className="item-meta">
                      <div 
                        className={`company-logo ${app.logoClass || ''}`}
                        style={app.customBg ? { background: app.customBg } : {}}
                      >
                        {app.logoLetter}
                      </div>
                      <div className="item-details">
                        <span className="item-role">{app.role}</span>
                        <span className="item-company">{app.company}</span>
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
                  >
                    <div className="item-meta">
                      <div 
                        className={`company-logo ${app.logoClass || ''}`}
                        style={app.customBg ? { background: app.customBg } : {}}
                      >
                        {app.logoLetter}
                      </div>
                      <div className="item-details">
                        <span className="item-role">{app.role}</span>
                        <span className="item-company">{app.company}</span>
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
                  >
                    <div className="item-meta">
                      <div 
                        className={`company-logo ${app.logoClass || ''}`}
                        style={app.customBg ? { background: app.customBg } : {}}
                      >
                        {app.logoLetter}
                      </div>
                      <div className="item-details">
                        <span className="item-role">{app.role}</span>
                        <span className="item-company">{app.company}</span>
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
      </div>
    </div>
  );
}
