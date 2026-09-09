import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Modo = "login" | "cadastro" | "recuperar";

const traduzirErro = (msg: string): string => {
  if (msg.includes("Email not confirmed"))
    return "E-mail não confirmado. Verifique sua caixa de entrada (inclusive spam) e clique no link enviado.";
  if (msg.includes("Invalid login credentials"))
    return "E-mail ou senha incorretos. Verifique seus dados e tente novamente.";
  if (msg.includes("User already registered") || msg.includes("already registered"))
    return "Este e-mail já está cadastrado. Tente entrar na sua conta.";
  if (msg.includes("Password should be at least") || msg.includes("password"))
    return "A senha deve ter pelo menos 6 caracteres.";
  if (msg.includes("rate limit") || msg.includes("too many"))
    return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  if (msg.includes("network") || msg.includes("fetch"))
    return "Erro de conexão. Verifique sua internet e tente novamente.";
  if (msg.includes("valid email"))
    return "Digite um e-mail válido.";
  return msg;
};

export default function Login() {
  const [modo, setModo] = useState<Modo>("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrar, setLembrar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const trocarModo = (novoModo: Modo) => {
    setModo(novoModo);
    setErro(null);
    setSucesso(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setSucesso(null);
    setCarregando(true);

    if (modo === "recuperar") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      });
      setCarregando(false);
      if (error) {
        setErro(traduzirErro(error.message));
      } else {
        setSucesso("Link enviado! Verifique seu e-mail (inclusive a pasta de spam).");
      }
      return;
    }

    if (modo === "cadastro") {
      const { error } = await signUp(email, senha);
      setCarregando(false);
      if (error) {
        setErro(traduzirErro(error.message));
      } else {
        setSucesso(
          "Conta criada! Verifique seu e-mail e clique no link de confirmação antes de entrar."
        );
      }
      return;
    }

    const { error } = await signIn(email, senha, lembrar);
    setCarregando(false);
    if (error) {
      setErro(traduzirErro(error.message));
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        {/* Logo / título */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Organizze</h1>
          <p className="text-sm text-gray-500 mt-1">Controle financeiro pessoal</p>
        </div>

        {/* Toggle login / cadastro */}
        {modo !== "recuperar" && (
          <div className="flex bg-gray-100 rounded-full p-1 mb-6">
            <button
              type="button"
              onClick={() => trocarModo("login")}
              className={`flex-1 py-1.5 rounded-full text-sm font-medium transition-all ${
                modo === "login"
                  ? "bg-green-600 text-white shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => trocarModo("cadastro")}
              className={`flex-1 py-1.5 rounded-full text-sm font-medium transition-all ${
                modo === "cadastro"
                  ? "bg-green-600 text-white shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Criar conta
            </button>
          </div>
        )}

        {/* Título recuperar senha */}
        {modo === "recuperar" && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Recuperar senha</h2>
            <p className="text-sm text-gray-500 mt-1">
              Informe seu e-mail e enviaremos um link para redefinir sua senha.
            </p>
          </div>
        )}

        {/* Mensagem de sucesso */}
        {sucesso && (
          <div className="flex items-start gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{sucesso}</span>
          </div>
        )}

        {/* Mensagem de erro */}
        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo e-mail */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="pl-9 rounded-xl border-gray-200"
            />
          </div>

          {/* Campo senha (oculto no modo recuperar) */}
          {modo !== "recuperar" && (
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type={mostrarSenha ? "text" : "password"}
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                autoComplete={modo === "cadastro" ? "new-password" : "current-password"}
                className="pl-9 pr-9 rounded-xl border-gray-200"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          )}

          {/* Lembrar e esqueci a senha (só no login) */}
          {modo === "login" && (
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={lembrar}
                  onChange={(e) => setLembrar(e.target.checked)}
                  className="rounded accent-violet-600"
                />
                Lembrar-me
              </label>
              <button
                type="button"
                onClick={() => trocarModo("recuperar")}
                className="text-green-600 hover:underline"
              >
                Esqueci a senha
              </button>
            </div>
          )}

          <Button
            type="submit"
            disabled={carregando}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-2 font-semibold"
          >
            {carregando
              ? "Aguarde..."
              : modo === "login"
              ? "Entrar"
              : modo === "cadastro"
              ? "Criar conta"
              : "Enviar link"}
          </Button>
        </form>

        {/* Voltar ao login (modo recuperar) */}
        {modo === "recuperar" && (
          <button
            type="button"
            onClick={() => trocarModo("login")}
            className="mt-4 w-full text-sm text-gray-500 hover:text-green-600 text-center"
          >
            ← Voltar ao login
          </button>
        )}

        {/* Dica sobre confirmação de e-mail */}
        {modo === "cadastro" && !sucesso && (
          <p className="mt-4 text-xs text-gray-400 text-center">
            Após criar sua conta, você receberá um e-mail de confirmação.
          </p>
        )}
      </div>
    </div>
  );
}
