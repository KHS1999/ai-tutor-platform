'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: number;
  username: string;
  email: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  price: number;
  image_url: string;
}

interface UserCourseProgress {
  user_id: number;
  course_id: number;
  status: string;
  progress_percentage: number;
  last_accessed: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]); // All courses
  const [courseProgress, setCourseProgress] = useState<UserCourseProgress[]>([]); // User's progress
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch user profile
        const userResponse = await fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const userData = await userResponse.json();
        if (userResponse.ok) {
          setUser(userData.user);
        } else {
          setMessage(userData.message || '사용자 프로필을 불러오지 못했습니다');
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }

        // Fetch all courses
        const coursesResponse = await fetch('/api/courses');
        const coursesData = await coursesResponse.json();
        if (coursesResponse.ok) {
          setCourses(coursesData);
        } else {
          setMessage(coursesData.message || '강좌 목록을 불러오지 못했습니다');
        }

        // Fetch user's course progress
        const progressResponse = await fetch('/api/progress/course', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const progressData = await progressResponse.json();
        if (progressResponse.ok) {
          setCourseProgress(progressData);
        } else {
          setMessage(progressData.message || '진행 상황을 불러오지 못했습니다');
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setMessage('예상치 못한 오류가 발생했습니다');
        localStorage.removeItem('token');
        router.push('/login');
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <p>사용자 데이터를 불러오는 중이거나 리디렉션 중입니다...</p>
        {message && <p className="mt-4 text-center text-sm text-red-500">{message}</p>}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4">환영합니다, {user.username}님!</h1>
        <p className="text-lg mb-2">이메일: {user.email}</p>
        <p className="text-gray-600 text-sm mb-6">사용자 ID: {user.id}</p>

        <h2 className="text-2xl font-bold mb-4">내 강좌 진행 상황</h2>
        {courses.length === 0 ? (
          <p className="text-gray-600">아직 수강 중인 강좌가 없습니다.</p>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => {
              const progress = courseProgress.find(p => p.course_id === course.id);
              const status = progress ? progress.status : 'not_started';
              const percentage = progress ? progress.progress_percentage : 0;

              return (
                <div key={course.id} className="bg-gray-50 p-4 rounded-lg shadow-sm flex justify-between items-center">
                  <div>
                    <Link href={`/courses/${course.id}`} className="text-xl font-semibold text-blue-600 hover:underline">
                      {course.title}
                    </Link>
                    <p className="text-sm text-gray-600">진행 상태: {
                      status === 'not_started' ? '시작 안 함' :
                      status === 'in_progress' ? '진행 중' :
                      status === 'completed' ? '완료' : status
                    }</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{percentage.toFixed(0)}%</p>
                    <div className="w-24 bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={handleLogout}
          className="mt-8 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}

