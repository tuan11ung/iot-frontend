import { User, Mail, Phone, Github, FileDown, Book, Figma, Box } from 'lucide-react';

export function ProfilePage() {
  const userData = {
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '+84 123 456 789',
    github: 'github.com/nguyenvana',
    figma: 'figma.com/@nguyenvana',
    drawio: 'app.diagrams.net',
    avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&size=200&background=3b82f6&color=fff'
  };

  const handleDownloadPDF = () => {
    // Mock PDF download functionality
    console.log('Downloading PDF...');
  };

  const handleAPIDocsClick = () => {
    // Mock API docs navigation
    console.log('Opening API documentation...');
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile</h2>
      
      <div className="max-w-3xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Avatar and Name */}
          <div className="flex flex-col items-center mb-8 pb-8 border-b border-gray-200">
            <img 
              src={userData.avatar} 
              alt="Avatar" 
              className="w-32 h-32 rounded-full border-4 border-blue-500 mb-4"
            />
            <h3 className="text-2xl font-bold text-gray-800">{userData.name}</h3>
          </div>

          {/* User Information */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-800">{userData.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Số điện thoại</p>
                <p className="font-medium text-gray-800">{userData.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Github className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Github</p>
                <a 
                  href={`https://${userData.github}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:underline"
                >
                  {userData.github}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Figma className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Figma</p>
                <a 
                  href={`https://${userData.figma}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:underline"
                >
                  {userData.figma}
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Box className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Draw.io</p>
                <a 
                  href={`https://${userData.drawio}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:underline"
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
              className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <FileDown className="w-5 h-5" />
              Download PDF
            </button>

            <button 
              onClick={handleAPIDocsClick}
              className="flex items-center justify-center gap-2 bg-gray-800 text-white py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors"
            >
              <Book className="w-5 h-5" />
              API DOCS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}