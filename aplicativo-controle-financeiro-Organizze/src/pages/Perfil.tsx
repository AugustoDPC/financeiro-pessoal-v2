import React, { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GerenciadorCategorias } from "@/components/configuracoes/GerenciadorCategorias";
import { GerenciadorBackup } from "@/components/configuracoes/GerenciadorBackup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Camera, LogOut, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getPerfil, savePerfil } from "@/services/supabase/perfilSupabase";

interface PerfilUsuario {
  name: string;
  avatar: string;
}

const EDITOR_SIZE = 192; // px — largura/altura do círculo editor (w-48)

export default function Perfil() {
  const [perfil, setPerfil]               = useState<PerfilUsuario>({ name: "", avatar: "" });
  const [perfilOriginal, setPerfilOriginal] = useState<PerfilUsuario>({ name: "", avatar: "" });
  const [isEditing, setIsEditing]         = useState(false);
  const [salvando, setSalvando]           = useState(false);
  const [deletandoConta, setDeletandoConta] = useState(false);

  // Editor de foto
  const [avatarOriginal, setAvatarOriginal] = useState("");
  const [editandoFoto, setEditandoFoto]     = useState(false);
  const [posicaoFoto, setPosicaoFoto]       = useState({ x: 50, y: 50 });
  const [zoomFoto, setZoomFoto]             = useState(1.5);
  const [isDragging, setIsDragging]         = useState(false);
  const [dragStart, setDragStart]           = useState({ x: 0, y: 0 });
  const editorRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();
  const { user, signOut, deleteAccount } = useAuth();

  // ── Carregar perfil do banco ──────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;

    getPerfil(user.id)
      .then((dados) => {
        setPerfil(dados);
        setPerfilOriginal(dados);
        // Sincroniza sidebar via localStorage
        localStorage.setItem("userProfile", JSON.stringify(dados));
        window.dispatchEvent(new CustomEvent("profileUpdated", { detail: dados }));
      })
      .catch(() => {
        // Fallback: tenta localStorage se banco falhar
        const salvo = localStorage.getItem("userProfile");
        if (salvo) {
          const dados = JSON.parse(salvo);
          setPerfil(dados);
          setPerfilOriginal(dados);
        }
      });
  }, [user?.id]);

  // ── Salvar perfil no banco ────────────────────────────────────────────────
  const salvarPerfil = async () => {
    if (!user?.id) return;
    setSalvando(true);
    try {
      await savePerfil(user.id, perfil.name, perfil.avatar);
      setPerfilOriginal(perfil);
      // Sincroniza sidebar
      localStorage.setItem("userProfile", JSON.stringify(perfil));
      window.dispatchEvent(new CustomEvent("profileUpdated", { detail: perfil }));
      setIsEditing(false);
      toast({ title: "Perfil atualizado", description: "Suas informações foram salvas com sucesso!" });
    } catch {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o perfil. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSalvando(false);
    }
  };

  const cancelarEdicao = () => {
    setPerfil(perfilOriginal);
    setIsEditing(false);
  };

  // ── Upload de imagem → abre editor ───────────────────────────────────────
  const enviarImagem = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        setAvatarOriginal(src);
        setPosicaoFoto({ x: 50, y: 50 });
        setZoomFoto(1.5);
        setEditandoFoto(true);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = "";
  };

  // ── Drag (mouse) ─────────────────────────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setPosicaoFoto((prev) => ({
      x: Math.max(0, Math.min(100, prev.x + (dx / EDITOR_SIZE) * 100)),
      y: Math.max(0, Math.min(100, prev.y + (dy / EDITOR_SIZE) * 100)),
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoomFoto((prev) => Math.max(1, Math.min(4, prev - e.deltaY * 0.002)));
  };

  // ── Drag (touch / mobile) ─────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: t.clientX, y: t.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const t = e.touches[0];
    const dx = t.clientX - dragStart.x;
    const dy = t.clientY - dragStart.y;
    setPosicaoFoto((prev) => ({
      x: Math.max(0, Math.min(100, prev.x + (dx / EDITOR_SIZE) * 100)),
      y: Math.max(0, Math.min(100, prev.y + (dy / EDITOR_SIZE) * 100)),
    }));
    setDragStart({ x: t.clientX, y: t.clientY });
  };

  // ── Confirmar foto: recorta visível via canvas ────────────────────────────
  const confirmarFoto = () => {
    const canvas = document.createElement("canvas");
    const OUTPUT = 400;
    canvas.width  = OUTPUT;
    canvas.height = OUTPUT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      const imgW   = zoomFoto * EDITOR_SIZE;
      const imgH   = zoomFoto * EDITOR_SIZE;
      const imgL   = (posicaoFoto.x / 100) * EDITOR_SIZE - imgW / 2;
      const imgT   = (posicaoFoto.y / 100) * EDITOR_SIZE - imgH / 2;

      const visX = Math.max(0, -imgL);
      const visY = Math.max(0, -imgT);
      const visW = Math.min(EDITOR_SIZE, imgL + imgW) - Math.max(0, imgL);
      const visH = Math.min(EDITOR_SIZE, imgT + imgH) - Math.max(0, imgT);

      const scaleX = img.naturalWidth  / imgW;
      const scaleY = img.naturalHeight / imgH;

      const scale = OUTPUT / EDITOR_SIZE;
      ctx.drawImage(
        img,
        visX * scaleX,              visY * scaleY,
        visW * scaleX,              visH * scaleY,
        Math.max(0, imgL) * scale,  Math.max(0, imgT) * scale,
        visW * scale,               visH * scale,
      );

      const cropped = canvas.toDataURL("image/jpeg", 0.92);
      setPerfil((prev) => ({ ...prev, avatar: cropped }));
      setEditandoFoto(false);
      setAvatarOriginal("");
    };
    img.src = avatarOriginal;
  };

  const cancelarFoto = () => {
    setEditandoFoto(false);
    setAvatarOriginal("");
  };

  // ── Logout com confirmação ────────────────────────────────────────────────
  const handleSignOut = () => {
    signOut();
  };

  // ── Excluir conta ─────────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    setDeletandoConta(true);
    const { error } = await deleteAccount();
    setDeletandoConta(false);
    if (error) {
      toast({
        title: "Erro ao excluir conta",
        description: "Não foi possível excluir a conta. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    if (!name.trim()) return "?";
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Perfil</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie suas informações pessoais</p>
        </div>

        <div className="w-full max-w-2xl">
          <GerenciadorCategorias />
        </div>

        <div className="w-full max-w-2xl">
          <GerenciadorBackup />
        </div>

        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* ── Editor de posicionamento de foto ── */}
            {editandoFoto ? (
              <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Arraste para reposicionar • Use o scroll ou o controle abaixo para zoom
                </p>

                <div
                  ref={editorRef}
                  className="relative rounded-full overflow-hidden border-2 border-primary select-none"
                  style={{ width: EDITOR_SIZE, height: EDITOR_SIZE, cursor: isDragging ? "grabbing" : "grab" }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleMouseUp}
                  onWheel={handleWheel}
                >
                  <img
                    src={avatarOriginal}
                    draggable={false}
                    alt="Editor de foto"
                    style={{
                      position: "absolute",
                      width: `${zoomFoto * 100}%`,
                      height: `${zoomFoto * 100}%`,
                      left: `${posicaoFoto.x}%`,
                      top: `${posicaoFoto.y}%`,
                      transform: "translate(-50%, -50%)",
                      maxWidth: "none",
                      pointerEvents: "none",
                    }}
                  />
                </div>

                <div className="flex items-center gap-3 w-full max-w-xs">
                  <ZoomOut className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <input
                    type="range" min="1" max="4" step="0.05"
                    value={zoomFoto}
                    onChange={(e) => setZoomFoto(Number(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <ZoomIn className="w-4 h-4 text-gray-500 flex-shrink-0" />
                </div>

                <div className="flex gap-2">
                  <Button size="sm" onClick={confirmarFoto}>Confirmar foto</Button>
                  <Button size="sm" variant="outline" onClick={cancelarFoto}>Cancelar</Button>
                </div>
              </div>

            ) : (
              /* ── Avatar normal ── */
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                    {perfil.avatar ? (
                      <img src={perfil.avatar} alt={perfil.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-medium text-muted-foreground">
                        {getInitials(perfil.name)}
                      </span>
                    )}
                  </div>

                  {isEditing && (
                    <label className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors">
                      <Camera className="w-4 h-4" />
                      <input type="file" accept="image/*" onChange={enviarImagem} className="hidden" />
                    </label>
                  )}
                </div>

                <div>
                  <h3 className="font-medium text-lg">{perfil.name || "Sem nome"}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isEditing ? "Clique na câmera para alterar a foto" : "Sua foto de perfil"}
                  </p>
                </div>
              </div>
            )}

            {/* ── Campo nome — só no modo edição ── */}
            {isEditing && !editandoFoto && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={perfil.name}
                  onChange={(e) => setPerfil((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Digite seu nome completo"
                />
              </div>
            )}

            {/* ── Botões salvar / cancelar / editar ── */}
            {!editandoFoto && (
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={salvarPerfil} disabled={salvando}>
                      {salvando ? "Salvando..." : "Salvar"}
                    </Button>
                    <Button variant="outline" onClick={cancelarEdicao} disabled={salvando}>
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>Editar Perfil</Button>
                )}
              </div>
            )}

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* ── Ações de conta ── */}
            <div className="space-y-3">

              {/* Sair da conta — com confirmação */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair da conta
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sair da conta?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Você será desconectado e precisará fazer login novamente para acessar o app.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSignOut}>
                      Confirmar saída
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Excluir conta — com confirmação */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir conta permanentemente
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir conta permanentemente?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Todos os seus dados — contas, transações,
                      categorias e metas — serão excluídos permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={handleDeleteAccount}
                      disabled={deletandoConta}
                    >
                      {deletandoConta ? "Excluindo..." : "Sim, excluir minha conta"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
