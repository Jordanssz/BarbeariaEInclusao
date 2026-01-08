package br.cefetmg.barbeariainclusao.controller;

import br.cefetmg.barbeariainclusao.model.Barbeiro;
import br.cefetmg.barbeariainclusao.repository.BarbeiroRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:8100")
@RestController
@RequestMapping("/api/v1/barbeiro")
public class BarbeiroController {

    private final BarbeiroRepository barbeiroRepository;
    private final ObjectMapper mapper = new ObjectMapper();

    public BarbeiroController(BarbeiroRepository barbeiroRepository) {
        this.barbeiroRepository = barbeiroRepository;
    }

    // CREATE - SEM FOTO
    @PostMapping({"", "/"})
    public ResponseEntity<Barbeiro> create(@RequestBody Barbeiro barbeiro) {
        validarCamposObrigatorios(barbeiro);

        int total;
        try {
            total = barbeiroRepository.countByBarbearia(barbeiro.getIdBarbeariaBarbeiro());
        } catch (Exception e) {
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao contar barbeiros: " + e.getMessage());
        }

        if (total >= 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Limite de barbeiros por barbearia atingido");
        }

        try {
            Long id = barbeiroRepository.insert(barbeiro);
            barbeiro.setIdBarbeiro(id);
            return ResponseEntity.status(HttpStatus.CREATED).body(barbeiro);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao salvar barbeiro: " + e.getMessage());
        }
    }

    // CREATE - COM FOTO
    @PostMapping(value = "/com-foto", consumes = {"multipart/form-data"})
    public ResponseEntity<?> createWithPhoto(
            @RequestPart("barbeiro") String barbeiroJson,
            @RequestPart(value = "file", required = false) MultipartFile fotoFile
    ) {
        try {
            Barbeiro barbeiro = mapper.readValue(barbeiroJson, Barbeiro.class);

            // logs para diagnóstico
            System.out.println("Recebido barbeiro: " + barbeiro);
            System.out.println("Arquivo recebido: " + (fotoFile != null ? fotoFile.getOriginalFilename() : "Nenhum arquivo"));

            // validação
            validarCamposObrigatorios(barbeiro);

            int total = barbeiroRepository.countByBarbearia(barbeiro.getIdBarbeariaBarbeiro());
            if (total >= 5) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Limite de barbeiros por barbearia atingido");
            }

            // salva foto fisicamente (se houver) e guarda caminho no objeto
            if (fotoFile != null && !fotoFile.isEmpty()) {
                String caminho = salvarFotoLocal(fotoFile);
                barbeiro.setFotoBarbeiro(caminho);
            } else {
                barbeiro.setFotoBarbeiro(null);
            }

            Long id = barbeiroRepository.insert(barbeiro);
            barbeiro.setIdBarbeiro(id);

            return ResponseEntity.status(HttpStatus.CREATED).body(barbeiro);

        } catch (IOException e) {
            // erro desserializando JSON
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("JSON do barbeiro inválido: " + e.getMessage());
        } catch (ResponseStatusException rse) {
            // repassa validações feitas por validarCamposObrigatorios
            throw rse;
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro interno: " + e.getMessage());
        }
    }

    // UPDATE - SEM FOTO
    @PutMapping("/{id}")
    public ResponseEntity<Barbeiro> update(@PathVariable Long id, @RequestBody Barbeiro barbeiro) {
        if (barbeiro.getIdBarbeiro() == null || !barbeiro.getIdBarbeiro().equals(id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID do barbeiro inválido");
        }

        if (!barbeiroRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Barbeiro não encontrado");
        }

        try {
            int qtd = barbeiroRepository.update(barbeiro);
            if (qtd == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhum barbeiro alterado");
            if (qtd > 1) throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Mais de um barbeiro alterado!");
            return ResponseEntity.ok(barbeiro);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao atualizar barbeiro: " + e.getMessage());
        }
    }

    // UPDATE - COM FOTO
    @PutMapping(value = "/com-foto/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<Barbeiro> updateWithPhoto(
            @PathVariable Long id,
            @RequestPart("barbeiro") String barbeiroJson,
            @RequestPart(value = "file", required = false) MultipartFile fotoFile
    ) {
        Barbeiro barbeiro;
        try {
            barbeiro = mapper.readValue(barbeiroJson, Barbeiro.class);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "JSON inválido: " + e.getMessage());
        }

        if (barbeiro.getIdBarbeiro() == null || !barbeiro.getIdBarbeiro().equals(id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID do barbeiro inválido");
        }

        if (!barbeiroRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Barbeiro não encontrado");
        }

        if (fotoFile != null && !fotoFile.isEmpty()) {
            String caminhoFoto = salvarFotoLocal(fotoFile);
            barbeiro.setFotoBarbeiro(caminhoFoto);
        }

        try {
            int qtd = barbeiroRepository.update(barbeiro);
            if (qtd == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhum barbeiro alterado");
            return ResponseEntity.ok(barbeiro);
        } catch (Exception e) {
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao atualizar barbeiro: " + e.getMessage());
        }
    }

    // demais
    @GetMapping("/{id}")
    public ResponseEntity<Barbeiro> getById(@PathVariable Long id) {
        Barbeiro barbeiro = barbeiroRepository.findById(id);
        if (barbeiro != null) return ResponseEntity.ok(barbeiro);
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Barbeiro não encontrado");
    }

    @GetMapping({"", "/"})
    public ResponseEntity<List<Barbeiro>> getAll() {
        return ResponseEntity.ok(barbeiroRepository.findAll());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!barbeiroRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Barbeiro não encontrado");
        }
        int qtd = barbeiroRepository.delete(id);
        if (qtd == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhum barbeiro excluído.");
        if (qtd > 1) throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Mais de um barbeiro excluído.");
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/barbearia/{idBarbearia}")
    public ResponseEntity<List<Barbeiro>> getByBarbearia(@PathVariable Long idBarbearia) {
        return ResponseEntity.ok(barbeiroRepository.findAssociatedByBarbearia(idBarbearia));
    }

    @PostMapping("/login")
    public ResponseEntity<Barbeiro> login(@RequestBody LoginRequest loginRequest) {
        if (loginRequest.getEmailBarbeiro() == null || loginRequest.getSenhaBarbeiro() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email e senha são obrigatórios");
        }
        Barbeiro barbeiro = barbeiroRepository.findByEmailAndSenha(
                loginRequest.getEmailBarbeiro(),
                loginRequest.getSenhaBarbeiro()
        );
        if (barbeiro == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou senha inválidos");
        }
        return ResponseEntity.ok(barbeiro);
    }

    @PostMapping("/vincular-por-codigo")
    public ResponseEntity<?> vincularPorCodigo(@RequestBody VincularRequest vincularRequest) {
        // Validações
        if (vincularRequest.getCodigoBarbeiro() == null || vincularRequest.getCodigoBarbeiro().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Código do barbeiro é obrigatório"));
        }

        if (vincularRequest.getIdBarbearia() == null || vincularRequest.getIdBarbearia() <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("ID da barbearia é obrigatório"));
        }

        try {
            // Converte o código para Long (ID do barbeiro)
            Long idBarbeiro = Long.parseLong(vincularRequest.getCodigoBarbeiro());

            // Busca o barbeiro pelo ID
            Barbeiro barbeiro = barbeiroRepository.findById(idBarbeiro);
            if (barbeiro == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("Barbeiro não encontrado com o código informado"));
            }

            // Substitui a barbearia associada (permite trocar de barbearia)
            barbeiro.setIdBarbeariaBarbeiro(vincularRequest.getIdBarbearia());

            // Atualiza no banco de dados
            int qtd = barbeiroRepository.update(barbeiro);
            if (qtd == 0) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new ErrorResponse("Erro ao atualizar barbeiro"));
            }

            return ResponseEntity.ok(new SuccessResponse("Barbeiro vinculado com sucesso", barbeiro));

        } catch (NumberFormatException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Código do barbeiro deve ser um número válido"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erro ao vincular barbeiro: " + e.getMessage()));
        }
    }

    // auxiliares
    private void validarCamposObrigatorios(Barbeiro b) {
        if (b == null ||
            b.getNomeBarbeiro() == null ||
            b.getDescricaoBarbeiro() == null ||
            b.getEmailBarbeiro() == null ||
            b.getTelefoneBarbeiro() == null ||
            b.getSenhaBarbeiro() == null ||
            b.getIdBarbeariaBarbeiro() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todos os campos obrigatórios devem ser preenchidos");
        }
    }

    private String salvarFotoLocal(MultipartFile file) {
        try {
            String nomeArquivo = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path diretorio = Paths.get("uploads/fotos");
            Files.createDirectories(diretorio);
            Path caminho = diretorio.resolve(nomeArquivo);
            Files.copy(file.getInputStream(), caminho, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/fotos/" + nomeArquivo;
        } catch (IOException e) {
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao salvar foto: " + e.getMessage());
        }
    }

    public static class LoginRequest {
        private String emailBarbeiro;
        private String senhaBarbeiro;
        public String getEmailBarbeiro() { return emailBarbeiro; }
        public void setEmailBarbeiro(String emailBarbeiro) { this.emailBarbeiro = emailBarbeiro; }
        public String getSenhaBarbeiro() { return senhaBarbeiro; }
        public void setSenhaBarbeiro(String senhaBarbeiro) { this.senhaBarbeiro = senhaBarbeiro; }
    }

    public static class VincularRequest {
        private String codigoBarbeiro;
        private Long idBarbearia;

        public String getCodigoBarbeiro() { return codigoBarbeiro; }
        public void setCodigoBarbeiro(String codigoBarbeiro) { this.codigoBarbeiro = codigoBarbeiro; }
        public Long getIdBarbearia() { return idBarbearia; }
        public void setIdBarbearia(Long idBarbearia) { this.idBarbearia = idBarbearia; }
    }

    public static class ErrorResponse {
        private String mensagem;

        public ErrorResponse(String mensagem) { this.mensagem = mensagem; }
        public String getMensagem() { return mensagem; }
        public void setMensagem(String mensagem) { this.mensagem = mensagem; }
    }

    public static class SuccessResponse {
        private String mensagem;
        private Barbeiro barbeiro;

        public SuccessResponse(String mensagem, Barbeiro barbeiro) {
            this.mensagem = mensagem;
            this.barbeiro = barbeiro;
        }

        public String getMensagem() { return mensagem; }
        public void setMensagem(String mensagem) { this.mensagem = mensagem; }
        public Barbeiro getBarbeiro() { return barbeiro; }
        public void setBarbeiro(Barbeiro barbeiro) { this.barbeiro = barbeiro; }
    }

    @PostMapping("/desvincular")
public ResponseEntity<?> desvincular(@RequestBody DesvincularRequest request) {
    if (request.getIdBarbeiro() == null || request.getIdBarbearia() == null) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("IDs do barbeiro e da barbearia são obrigatórios"));
    }

    try {
        // Executa a remoção na tabela de ligação
        int qtd = barbeiroRepository.desvincularRelacao(request.getIdBarbeiro(), request.getIdBarbearia());

        if (qtd == 0) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("Vínculo não encontrado para realizar a exclusão."));
        }

        return ResponseEntity.ok(new GenericSuccessResponse("Profissional desvinculado com sucesso!"));

    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Erro ao desvincular: " + e.getMessage()));
    }
}

public static class DesvincularRequest {
    private Long idBarbeiro;
    private Long idBarbearia;

    public Long getIdBarbeiro() { return idBarbeiro; }
    public void setIdBarbeiro(Long idBarbeiro) { this.idBarbeiro = idBarbeiro; }
    public Long getIdBarbearia() { return idBarbearia; }
    public void setIdBarbearia(Long idBarbearia) { this.idBarbearia = idBarbearia; }
}

// Resposta genérica de sucesso caso queira reutilizar
public static class GenericSuccessResponse {
    private String mensagem;
    public GenericSuccessResponse(String mensagem) { this.mensagem = mensagem; }
    public String getMensagem() { return mensagem; }
}
}
