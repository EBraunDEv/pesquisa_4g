"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2, Plus, LogOut } from "lucide-react"

interface SuccessScreenProps {
  onNewSurvey: () => void
  onLogout: () => void
}

export default function SuccessScreen({ onNewSurvey, onLogout }: SuccessScreenProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="text-center">
        <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-accent" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">Pesquisa Enviada!</h1>
        <p className="text-muted-foreground mb-8">Os dados foram registrados com sucesso.</p>

        <div className="space-y-4 w-full max-w-xs mx-auto">
          <Button onClick={onNewSurvey} className="w-full h-14 rounded-xl text-base font-bold">
            <Plus className="w-5 h-5 mr-2" />
            Nova Pesquisa
          </Button>

          <Button
            onClick={onLogout}
            variant="outline"
            className="w-full h-14 rounded-xl text-base font-medium bg-transparent"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  )
}
