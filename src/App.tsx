import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { LandingPage } from './pages/LandingPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { FindJobsPage } from './pages/FindJobsPage.tsx';
import { SavedJobsPage } from './pages/SavedJobsPage.tsx';
import { ApplicationsPage } from './pages/ApplicationsPage.tsx';
import { MyCVPage } from './pages/MyCVPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { ApplicationAnswersPage } from './pages/ApplicationAnswersPage.tsx';
import { InterviewPrepPage } from './pages/InterviewPrepPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';

import { JobAnalysisModal } from './components/JobAnalysisModal.tsx';
import { CVTailoringModal } from './components/CVTailoringModal.tsx';
import { CoverLetterModal } from './components/CoverLetterModal.tsx';
import { ManualJobModal } from './components/ManualJobModal.tsx';
import { ApplicationAssistantModal } from './components/ApplicationAssistantModal.tsx';

import { User, Job } from './types/index.ts';
import { api, getStoredToken, setStoredToken, clearStoredToken } from './services/api.ts';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [loadingUser, setLoadingUser] = useState(true);

  // Modals
  const [analyzingJob, setAnalyzingJob] = useState<Job | null>(null);
  const [tailoringJob, setTailoringJob] = useState<Job | null>(null);
  const [coverLetterJob, setCoverLetterJob] = useState<Job | null>(null);
  const [interviewJob, setInterviewJob] = useState<Job | null>(null);
  const [manualJobOpen, setManualJobOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    setLoadingUser(true);
    try {
      const token = getStoredToken();
      if (token) {
        const res = await api.auth.me();
        setUser(res.user);
        setActiveTab('dashboard');
      } else {
        // Auto-seed demo user session for instant seamless preview
        const demoRes = await api.auth.demoLogin();
        setStoredToken(demoRes.token);
        setUser(demoRes.user);
        setActiveTab('dashboard');
      }
    } catch (err) {
      console.warn('Auto-login notice, offering guest mode:', err);
      clearStoredToken();
      setUser(null);
      setActiveTab('landing');
    } finally {
      setLoadingUser(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout();
    } catch (e) {
      // ignore
    }
    clearStoredToken();
    setUser(null);
    setActiveTab('landing');
  };

  const handleExploreDemo = async () => {
    try {
      const demoRes = await api.auth.demoLogin();
      setStoredToken(demoRes.token);
      setUser(demoRes.user);
      setActiveTab('dashboard');
    } catch (err) {
      console.error('Error starting demo:', err);
    }
  };

  const handleJobCreated = (job: Job) => {
    setAnalyzingJob(job);
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-700">Starting Job Hunter AI engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Header Navbar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onOpenAssistant={() => setAssistantOpen(true)}
      />

      {/* Main Page Body */}
      <main className="flex-1">
        {!user || activeTab === 'landing' ? (
          <LandingPage
            onLoginSuccess={(u) => {
              setUser(u);
              setActiveTab('dashboard');
            }}
            onExploreDemo={handleExploreDemo}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardPage
                user={user}
                onNavigate={setActiveTab}
                onAnalyzeJob={(job) => setAnalyzingJob(job)}
                onTailorCV={(job) => setTailoringJob(job)}
                onCoverLetter={(job) => setCoverLetterJob(job)}
                onInterviewPrep={(job) => {
                  setInterviewJob(job);
                  setActiveTab('interview');
                }}
                onOpenManualJob={() => setManualJobOpen(true)}
              />
            )}

            {activeTab === 'jobs' && (
              <FindJobsPage
                onAnalyzeJob={(job) => setAnalyzingJob(job)}
                onTailorCV={(job) => setTailoringJob(job)}
                onCoverLetter={(job) => setCoverLetterJob(job)}
                onInterviewPrep={(job) => {
                  setInterviewJob(job);
                  setActiveTab('interview');
                }}
                onOpenManualJob={() => setManualJobOpen(true)}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'saved' && (
              <SavedJobsPage
                onAnalyzeJob={(job) => setAnalyzingJob(job)}
                onTailorCV={(job) => setTailoringJob(job)}
                onCoverLetter={(job) => setCoverLetterJob(job)}
                onInterviewPrep={(job) => {
                  setInterviewJob(job);
                  setActiveTab('interview');
                }}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'applications' && <ApplicationsPage />}

            {activeTab === 'cv' && <MyCVPage onNavigate={setActiveTab} />}

            {activeTab === 'profile' && <ProfilePage />}

            {activeTab === 'answers' && <ApplicationAnswersPage />}

            {activeTab === 'interview' && (
              <InterviewPrepPage
                initialJob={interviewJob}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsPage
                user={user}
                onResetDemo={() => {
                  checkCurrentUser();
                  setActiveTab('dashboard');
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Global Modals */}
      <JobAnalysisModal
        job={analyzingJob}
        isOpen={Boolean(analyzingJob)}
        onClose={() => setAnalyzingJob(null)}
        onTailorCV={(job) => {
          setAnalyzingJob(null);
          setTailoringJob(job);
        }}
        onCoverLetter={(job) => {
          setAnalyzingJob(null);
          setCoverLetterJob(job);
        }}
        onInterviewPrep={(job) => {
          setAnalyzingJob(null);
          setInterviewJob(job);
          setActiveTab('interview');
        }}
      />

      <CVTailoringModal
        job={tailoringJob}
        isOpen={Boolean(tailoringJob)}
        onClose={() => setTailoringJob(null)}
        onSavedVersion={() => {
          // Can refresh CV version lists if needed
        }}
      />

      <CoverLetterModal
        job={coverLetterJob}
        isOpen={Boolean(coverLetterJob)}
        onClose={() => setCoverLetterJob(null)}
      />

      <ManualJobModal
        isOpen={manualJobOpen}
        onClose={() => setManualJobOpen(false)}
        onJobCreated={handleJobCreated}
      />

      <ApplicationAssistantModal
        isOpen={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        onNavigate={setActiveTab}
      />
    </div>
  );
}
