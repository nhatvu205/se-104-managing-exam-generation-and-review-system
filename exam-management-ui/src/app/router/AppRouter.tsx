import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import { DashboardLayout } from '@/app/layouts/DashboardLayout'

import { DashboardPage } from '@/pages/DashboardPage'
import { QuestionBankPage } from '@/pages/QuestionBankPage'
import { QuestionFormPage } from '@/pages/QuestionFormPage'
import { ExamListPage } from '@/pages/ExamListPage'
import { ExamBuilderPage } from '@/pages/ExamBuilderPage'
import { ExamPreviewPage } from '@/pages/ExamPreviewPage'
import { PdfExportPage } from '@/pages/PdfExportPage'
import { SearchExamPage } from '@/pages/SearchExamPage'
import { GradingPage } from '@/pages/GradingPage'
import { GradingDetailPage } from '@/pages/GradingDetailPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          <Route
            path="/questions"
            element={<QuestionBankPage />}
          />

          <Route
            path="/questions/create"
            element={<QuestionFormPage />}
          />

          <Route
            path="/exams"
            element={<ExamListPage />}
          />

          <Route
            path="/exams/create"
            element={<ExamBuilderPage />}
          />

          <Route
            path="/exams/:id/preview"
            element={<ExamPreviewPage />}
          />

          <Route
            path="/exams/:id/export"
            element={<PdfExportPage />}
          />

          <Route
            path="/search"
            element={<SearchExamPage />}
          />


          <Route
            path="/grading"
            element={<GradingPage />}
          />

          <Route
            path="/grading/:id"
            element={<GradingDetailPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}