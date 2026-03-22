import { Mail, Phone, Github, FileDown, Book, Figma, Box } from 'lucide-react';

export function ProfilePage() {
  const userData = {
    name: 'Nguyễn Duy Tuấn Hưng',
    email: 'nguyenduytuan11ung@gmail.com',
    phone: '+84 977 192 935',
    github: 'https://github.com/tuan11ung',
    figma: 'https://www.figma.com/design/T5hYz6kO7ucs1Vw2WcGlWP/IoT-UI',
    drawio: 'https://app.diagrams.net/?src=about#G1xYyp89ClIwFUl7sFr0C-Tod6v7ylHAZS',
    avatar: '../public/assets/avatar.jpg'
  };

  const handleDownloadPDF = () => {
    console.log('Downloading PDF...');
  };

  const handleAPIDocsClick = () => {
    console.log('Opening API documentation...');
  };

  return (
    // 1. Dùng flex-col và chiếm tối thiểu chiều cao màn hình để tạo không gian
    <div className="p-8 flex flex-col min-h-screen overflow-y-auto">
      
      {/* 2. Tiêu đề để tự do, nó sẽ tự động dạt sang góc trên bên trái */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6 shrink-0">Profile</h2>
      
      {/* 3. Wrapper này dùng flex-1 để đẩy căng không gian còn lại, và dùng items-center justify-center để căn giữa Box */}
      <div className="flex-1 flex items-center justify-center"> 
        <div className="w-full max-w-3xl my-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            
            {/* Avatar and Name */}
            <div className="flex flex-col items-center mb-8 pb-8 border-b border-gray-200">
              <img 
                src={userData.avatar} 
                alt="Avatar" 
                className="w-32 h-32 object-cover rounded-full border-4 border-blue-500 mb-4 shadow-md"
              />
              <h3 className="text-2xl font-bold text-gray-800">{userData.name}</h3>
              {/* <p className="text-blue-600 font-medium mt-1">Sinh viên Thực hiện</p> */}
            </div>

            {/* User Information */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg">
                <Mail className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-800">{userData.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg">
                <Phone className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Số điện thoại</p>
                  <p className="font-medium text-gray-800">{userData.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg">
                <Github className="w-5 h-5 text-blue-600" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm text-gray-500">Github</p>
                  <a 
                    href={userData.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline truncate block"
                  >
                    {userData.github}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg">
                <Figma className="w-5 h-5 text-blue-600" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm text-gray-500">Figma</p>
                  <a 
                    href={userData.figma} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline truncate block"
                  >
                    {userData.figma}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg">
                <Box className="w-5 h-5 text-blue-600" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm text-gray-500">Draw.io</p>
                  <a 
                    href={userData.drawio} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline truncate block"
                  >
                    {userData.drawio}
                  </a>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={handleDownloadPDF}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 hover:shadow-lg transition-all"
              >
                <FileDown className="w-5 h-5" />
                Download PDF
              </button>

              <button 
                onClick={handleAPIDocsClick}
                className="flex items-center justify-center gap-2 bg-gray-800 text-white py-3 rounded-lg font-medium hover:bg-gray-900 hover:shadow-lg transition-all"
              >
                <Book className="w-5 h-5" />
                API DOCS
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}