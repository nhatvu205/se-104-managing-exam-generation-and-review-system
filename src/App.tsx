import type { ComponentType } from 'react';
import { useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import AdminDashboard from './pages/admin/A01_Dashboard';
import UserListPage from './pages/admin/A02_UserList';
import UserFormPage from './pages/admin/A03_UserForm';
import { AcademicYearFormPage, AcademicYearListPage } from './pages/admin/A04_A05_AcademicYear';
import { SemesterListPage } from './pages/admin/A06_A07_Semester';
import { ClassListPage } from './pages/admin/A08_A09_ClassManagement';
import SubjectListPage from './pages/admin/A10_SubjectList';
import LoginPage from './pages/shared/LoginPage';
import RegisterPage from './pages/shared/RegisterPage';
import ChangePasswordPage from './pages/shared/ChangePasswordPage';
import ErrorNoPermissionPage from './pages/shared/ErrorNoPermissionPage';
import AdminSubjectFormPage from './pages/admin/AdminSubjectFormPage';
import AdminSystemRulesPage from './pages/admin/AdminSystemRulesPage';
import AdminYearReportExportPage from './pages/admin/AdminYearReportExportPage';
import LecturerGradingSummaryPage from './pages/lecturer/LecturerGradingSummaryPage';
import LecturerRegradeManagementPage from './pages/lecturer/LecturerRegradeManagementPage';
import LecturerYearReportPage from './pages/lecturer/LecturerYearReportPage';

function RouteAccessibilitySupport() {
  const location = useLocation();

  useEffect(() => {
    const main = document.getElementById('main-content');
    if (main) main.focus();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return null;
}

function withNavigate<P extends object>(Component: ComponentType<P & { onNavigate: (key: string, path: string) => void }>, props?: P) {
  return function Wrapped() {
    const navigate = useNavigate();
    return <Component {...(props as P)} onNavigate={(_, path) => navigate(path)} />;
  };
}

const DashboardRoute = withNavigate(AdminDashboard);
const UsersRoute = withNavigate(UserListPage);
const UserCreateRoute = withNavigate(UserFormPage as any);
const UserEditRoute = withNavigate(UserFormPage as any);
const YearListRoute = withNavigate(AcademicYearListPage);
const YearCreateRoute = withNavigate(AcademicYearFormPage as any);
const SemesterListRoute = withNavigate(SemesterListPage);
const ClassListRoute = withNavigate(ClassListPage);
const SubjectListRoute = withNavigate(SubjectListPage);

export default function App() {
  return (
    <>
      <RouteAccessibilitySupport />
      <Routes>
        <Route path="/" element={<Navigate to="/shared/login" replace />} />
        <Route path="/preview" element={<Navigate to="/shared/login" replace />} />

        <Route path="/shared/login" element={<LoginPage />} />
        <Route path="/shared/register" element={<RegisterPage />} />
        <Route path="/shared/change-password" element={<ChangePasswordPage />} />
        <Route path="/shared/error" element={<ErrorNoPermissionPage />} />

        <Route path="/admin/dashboard" element={<DashboardRoute />} />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/users" element={<UsersRoute />} />
        <Route path="/admin/users/create" element={<UserCreateRoute />} />
        <Route path="/admin/users/:id/edit" element={<UserEditRoute />} />
        <Route path="/admin/academic-years" element={<YearListRoute />} />
        <Route path="/admin/academic-years/create" element={<YearCreateRoute />} />
        <Route path="/admin/semesters" element={<SemesterListRoute />} />
        <Route path="/admin/classes" element={<ClassListRoute />} />
        <Route path="/admin/subjects" element={<SubjectListRoute />} />
        <Route path="/admin/subjects/form" element={<AdminSubjectFormPage />} />
        <Route path="/admin/system-rules" element={<AdminSystemRulesPage />} />
        <Route path="/admin/year-report-export" element={<AdminYearReportExportPage />} />

        <Route path="/lecturer/grading-summary" element={<LecturerGradingSummaryPage />} />
        <Route path="/lecturer" element={<Navigate to="/lecturer/year-report" replace />} />
        <Route path="/lecturer/regrades" element={<LecturerRegradeManagementPage />} />
        <Route path="/lecturer/year-report" element={<LecturerYearReportPage />} />

        <Route path="*" element={<Navigate to="/shared/error" replace />} />
      </Routes>
    </>
  );
}
