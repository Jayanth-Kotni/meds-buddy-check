import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Check, Calendar as CalendarIcon, User } from "lucide-react";
import { format, isToday, isBefore, startOfDay } from "date-fns";
import MedicationTracker from "./MedicationTracker";
import api from "../lib/api";

const PatientDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [takenDates, setTakenDates] = useState<Set<string>>(new Set());
  const [medications, setMedications] = useState([]);
  const [adherence, setAdherence] = useState("0%");

  const token = localStorage.getItem("token");
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const isTodaySelected = isToday(selectedDate);
  const isSelectedDateTaken = takenDates.has(selectedDateStr);

  useEffect(() => {
    if (!token) return;

    api
      .get("/api/medications", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setMedications(res.data))
      .catch((err) => console.error("Fetch medications error:", err));

    api
      .get("/api/medications/adherence", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setAdherence(res.data.adherence))
      .catch((err) => console.error("Fetch adherence error:", err));
  }, []);

  const handleMarkTaken = async (medicationId: number) => {
    try {
      await api.post(
        `/api/medications/${medicationId}/taken`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTakenDates((prev) => new Set(prev).add(todayStr));
    } catch (error) {
      console.error("Error marking medication taken:", error);
    }
  };

  const getStreakCount = () => {
    let streak = 0;
    let currentDate = new Date(today);
    while (takenDates.has(format(currentDate, "yyyy-MM-dd")) && streak < 30) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    return streak;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">
              Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"}!
            </h2>
            <p className="text-white/90 text-lg">Ready to stay on track with your medication?</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{getStreakCount()}</div>
            <div className="text-white/80">Day Streak</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{takenDates.has(todayStr) ? "✓" : "○"}</div>
            <div className="text-white/80">Today's Status</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{adherence}</div>
            <div className="text-white/80">Monthly Rate</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
                {isTodaySelected ? "Today's Medication" : `Medication for ${format(selectedDate, "MMMM d, yyyy")}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MedicationTracker
                date={selectedDateStr}
                isTaken={isSelectedDateTaken}
                isToday={isTodaySelected}
                medicationId={medications[0]?.id} // Pass correct ID
                onTaken={() => setTakenDates((prev) => new Set(prev).add(selectedDateStr))}
              />

            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Medication Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="w-full"
                components={{
                  DayContent: ({ date }) => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    const isTaken = takenDates.has(dateStr);
                    const isPast = isBefore(date, startOfDay(today));
                    const isCurrentDay = isToday(date);
                    return (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <span>{date.getDate()}</span>
                        {isTaken && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-2 h-2 text-white" />
                          </div>
                        )}
                        {!isTaken && isPast && !isCurrentDay && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full" />
                        )}
                      </div>
                    );
                  },
                }}
              />
              <div className="mt-4 text-sm space-y-2">
                <div className="flex gap-2 items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span>Medication taken</span>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="w-3 h-3 bg-red-400 rounded-full" />
                  <span>Missed medication</span>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span>Today</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
