
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Upload, FileText, Calendar, Trash, Eye } from "lucide-react";

const MyNotes = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Mock notes data
  const notes = [
    {
      id: 1,
      title: "Biology Chapter 5 - Photosynthesis",
      uploadDate: "2024-06-10",
      fileCount: 3,
      lastUsed: "2 days ago",
      type: "PDF",
    },
    {
      id: 2,
      title: "History - World War II",
      uploadDate: "2024-06-05",
      fileCount: 1,
      lastUsed: "1 week ago",
      type: "PDF",
    },
    {
      id: 3,
      title: "Chemistry - Organic Compounds",
      uploadDate: "2024-05-28",
      fileCount: 2,
      lastUsed: "2 weeks ago",
      type: "Images",
    },
    {
      id: 4,
      title: "Physics - Newton's Laws",
      uploadDate: "2024-05-20",
      fileCount: 1,
      lastUsed: "3 weeks ago",
      type: "Text",
    },
    {
      id: 5,
      title: "Mathematics - Calculus Basics",
      uploadDate: "2024-05-15",
      fileCount: 4,
      lastUsed: "1 month ago",
      type: "PDF",
    },
  ];

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    return <FileText className="h-4 w-4" />;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "PDF":
        return "bg-red-100 text-red-700";
      case "Images":
        return "bg-green-100 text-green-700";
      case "Text":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center pt-8 pb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="mr-2 p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">My Notes</h1>
        </div>

        {/* Search and Upload */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search your notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base rounded-xl"
            />
          </div>
          
          <Button
            onClick={() => navigate("/upload")}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload New Notes
          </Button>
        </div>

        {/* Notes List */}
        <div className="space-y-3">
          {filteredNotes.length === 0 ? (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-8 pb-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No notes found</p>
                <p className="text-sm text-gray-500 mt-1">
                  {searchTerm ? "Try adjusting your search terms" : "Upload your first set of notes to get started"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotes.map((note) => (
              <Card key={note.id} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base text-gray-800 leading-tight mb-2">
                        {note.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>Uploaded {note.uploadDate}</span>
                        <span>•</span>
                        <span>Used {note.lastUsed}</span>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-md text-xs font-medium ${getTypeColor(note.type)}`}>
                      {note.type}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <FileText className="h-3 w-3 mr-1" />
                      <span>{note.fileCount} file{note.fileCount !== 1 ? 's' : ''}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Quick Stats */}
        {filteredNotes.length > 0 && (
          <Card className="shadow-lg border-0 bg-blue-50 border-blue-200">
            <CardContent className="pt-4 pb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-700">{notes.length}</div>
                <div className="text-sm text-blue-600">Total Notes Collections</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyNotes;
