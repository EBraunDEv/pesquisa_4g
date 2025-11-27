"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Signal, MapPin, User, LogOut, Loader2, ChevronDown, Navigation } from "lucide-react"
import type { User as UserType } from "@/app/page"
import { getSupabaseClient, type PesquisaSinal } from "@/lib/supabase"
import { getCurrentLocation, type GeolocationResult } from "@/lib/geolocation"

interface SurveyScreenProps {
  user: UserType | null
  onSubmit: () => void
  onLogout: () => void
}

const operadoras = ["Vivo", "Claro", "TIM", "Oi", "Outras"]

export default function SurveyScreen({ user, onSubmit, onLogout }: SurveyScreenProps) {
  const [formData, setFormData] = useState({
    nomeCidadao: "",
    endereco: "",
    localidade: "",
    temSinal: "",
    operadoras: [] as string[],
    precisaDeslocar: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showOperadoras, setShowOperadoras] = useState(false)
  const [location, setLocation] = useState<GeolocationResult>({
    latitude: null,
    longitude: null,
    error: null,
  })
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    handleGetLocation()
  }, [])

  const handleGetLocation = async () => {
    setIsGettingLocation(true)
    const result = await getCurrentLocation()
    setLocation(result)
    setIsGettingLocation(false)
  }

  const handleOperadoraChange = (operadora: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      operadoras: checked ? [...prev.operadoras, operadora] : prev.operadoras.filter((o) => o !== operadora),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSubmitError(null)

    try {
      // Buscar localização atualizada no momento do envio
      const currentLocation = await getCurrentLocation()

      const supabase = getSupabaseClient()

      const pesquisa: PesquisaSinal = {
        nome_cidadao: formData.nomeCidadao,
        endereco: formData.endereco,
        localidade: formData.localidade,
        tem_sinal: formData.temSinal === "sim",
        operadoras: formData.temSinal === "sim" ? formData.operadoras : [],
        precisa_deslocar: formData.precisaDeslocar === "sim",
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        agente_email: user?.email || null,
        agente_nome: user?.name || null,
      }

      const { error } = await supabase.from("pesquisas_sinal").insert([pesquisa])

      if (error) {
        throw new Error(error.message)
      }

      onSubmit()
    } catch (error) {
      console.error("Erro ao salvar pesquisa:", error)
      setSubmitError(error instanceof Error ? error.message : "Erro ao enviar pesquisa. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid =
    formData.nomeCidadao &&
    formData.endereco &&
    formData.localidade &&
    formData.temSinal &&
    (formData.temSinal === "nao" || formData.operadoras.length > 0) &&
    formData.precisaDeslocar

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-primary px-6 pt-10 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
              <Signal className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary-foreground">Nova Pesquisa</h1>
              <p className="text-primary-foreground/80 text-xs">Olá, {user?.name}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-10 h-10 bg-primary-foreground/20 rounded-xl flex items-center justify-center"
            aria-label="Sair"
          >
            <LogOut className="w-5 h-5 text-primary-foreground" />
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      location.latitude ? "bg-accent/20" : "bg-destructive/20"
                    }`}
                  >
                    <Navigation className={`w-4 h-4 ${location.latitude ? "text-accent" : "text-destructive"}`} />
                  </div>
                  <div>
                    <Label className="text-foreground font-semibold">Localização GPS</Label>
                    {isGettingLocation ? (
                      <p className="text-xs text-muted-foreground">Obtendo localização...</p>
                    ) : location.latitude && location.longitude ? (
                      <p className="text-xs text-accent">
                        {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                      </p>
                    ) : (
                      <p className="text-xs text-destructive">{location.error || "Não disponível"}</p>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleGetLocation}
                  disabled={isGettingLocation}
                  className="text-primary"
                >
                  {isGettingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : "Atualizar"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Nome do Cidadão */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <Label className="text-foreground font-semibold">Nome do Cidadão</Label>
              </div>
              <Input
                placeholder="Digite o nome completo"
                value={formData.nomeCidadao}
                onChange={(e) => setFormData((prev) => ({ ...prev, nomeCidadao: e.target.value }))}
                className="h-12 rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground"
                required
              />
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-accent" />
                </div>
                <Label className="text-foreground font-semibold">Endereço</Label>
              </div>
              <Input
                placeholder="Rua, número, bairro..."
                value={formData.endereco}
                onChange={(e) => setFormData((prev) => ({ ...prev, endereco: e.target.value }))}
                className="h-12 rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground"
                required
              />
            </CardContent>
          </Card>

          {/* Localidade/Comunidade */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-chart-3/10 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-chart-3" />
                </div>
                <Label className="text-foreground font-semibold">Localidade / Comunidade</Label>
              </div>
              <Input
                placeholder="Nome da comunidade ou localidade"
                value={formData.localidade}
                onChange={(e) => setFormData((prev) => ({ ...prev, localidade: e.target.value }))}
                className="h-12 rounded-xl bg-secondary border-0 text-foreground placeholder:text-muted-foreground"
                required
              />
            </CardContent>
          </Card>

          {/* Tem Sinal */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Signal className="w-4 h-4 text-primary" />
                </div>
                <Label className="text-foreground font-semibold">Nesse local há sinal de celular?</Label>
              </div>
              <RadioGroup
                value={formData.temSinal}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, temSinal: value }))}
                className="flex gap-4"
              >
                <label
                  className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl cursor-pointer transition-all ${
                    formData.temSinal === "sim" ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground"
                  }`}
                >
                  <RadioGroupItem value="sim" id="sim" className="sr-only" />
                  <span className="font-medium">Sim</span>
                </label>
                <label
                  className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl cursor-pointer transition-all ${
                    formData.temSinal === "nao"
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  <RadioGroupItem value="nao" id="nao" className="sr-only" />
                  <span className="font-medium">Não</span>
                </label>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Operadoras (só aparece se tem sinal) */}
          {formData.temSinal === "sim" && (
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <button
                  type="button"
                  onClick={() => setShowOperadoras(!showOperadoras)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-chart-4/10 rounded-lg flex items-center justify-center">
                      <Signal className="w-4 h-4 text-chart-4" />
                    </div>
                    <div className="text-left">
                      <Label className="text-foreground font-semibold cursor-pointer">Qual(is) operadora(s)?</Label>
                      {formData.operadoras.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">{formData.operadoras.join(", ")}</p>
                      )}
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform ${
                      showOperadoras ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showOperadoras && (
                  <div className="mt-4 space-y-3">
                    {operadoras.map((op) => (
                      <label
                        key={op}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                          formData.operadoras.includes(op) ? "bg-primary/10" : "bg-secondary"
                        }`}
                      >
                        <Checkbox
                          checked={formData.operadoras.includes(op)}
                          onCheckedChange={(checked) => handleOperadoraChange(op, checked as boolean)}
                        />
                        <span className="text-foreground font-medium">{op}</span>
                      </label>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Precisa se deslocar */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-chart-5/10 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-chart-5" />
                </div>
                <Label className="text-foreground font-semibold text-sm">
                  Precisa se deslocar para outro ponto para ter sinal?
                </Label>
              </div>
              <RadioGroup
                value={formData.precisaDeslocar}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, precisaDeslocar: value }))}
                className="flex gap-4"
              >
                <label
                  className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl cursor-pointer transition-all ${
                    formData.precisaDeslocar === "sim" ? "bg-chart-3 text-foreground" : "bg-secondary text-foreground"
                  }`}
                >
                  <RadioGroupItem value="sim" id="deslocar-sim" className="sr-only" />
                  <span className="font-medium">Sim</span>
                </label>
                <label
                  className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl cursor-pointer transition-all ${
                    formData.precisaDeslocar === "nao"
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  <RadioGroupItem value="nao" id="deslocar-nao" className="sr-only" />
                  <span className="font-medium">Não</span>
                </label>
              </RadioGroup>
            </CardContent>
          </Card>

          {submitError && (
            <Card className="border-0 shadow-md bg-destructive/10">
              <CardContent className="p-4">
                <p className="text-destructive text-sm text-center">{submitError}</p>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="pt-4 pb-8">
            <Button
              type="submit"
              className="w-full h-14 rounded-xl text-base font-bold shadow-lg"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Pesquisa"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
