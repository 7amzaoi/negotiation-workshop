import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { ToastContainer } from './components/Toast'
import { HomePage } from './pages/HomePage'
import { ResultsPage } from './pages/ResultsPage'
import { AgreementsPage } from './pages/AgreementsPage'
import { DashboardPage } from './pages/DashboardPage'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-bg">
        <ToastContainer />
        <Routes>
          {/* Dashboard has its own header/layout (login screen) */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Public pages share the Header */}
          <Route
            path="*"
            element={
              <>
                <Header />
                <main>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/results" element={<ResultsPage />} />
                    <Route path="/agreements" element={<AgreementsPage />} />
                  </Routes>
                </main>
              </>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
