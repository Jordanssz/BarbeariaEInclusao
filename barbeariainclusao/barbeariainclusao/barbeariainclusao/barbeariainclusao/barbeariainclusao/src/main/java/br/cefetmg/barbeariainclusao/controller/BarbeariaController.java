package br.cefetmg.barbeariainclusao.controller;

import br.cefetmg.barbeariainclusao.model.Barbearia;
import br.cefetmg.barbeariainclusao.repository.BarbeariaRepository;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:8100")
@RestController
@RequestMapping("/api/v1/barbearia")
public class BarbeariaController {

    private final BarbeariaRepository barbeariaRepository;

    // Constante para o raio da Terra em quilômetros (usado na fórmula de Haversine)
    private static final int RAIO_TERRA_KM = 6371;
    // Constante para conversão de graus para radianos
    private static final double DEG_TO_RAD = Math.PI / 180;

    // DTO para retorno com a distância calculada
    @Getter 
    @Setter
    public static class BarbeariaComDistanciaDto {
        private Long idBarbearia;
        private String nomeBarbearia;
        private String enderecoBarbearia;
        private String descricaoBarbearia;
        private String emailBarbearia;
        private byte[] fotoBarbearia;
        private Double latitude;
        private Double longitude;

        private Double distanciaKm; 
    }

    public BarbeariaController(BarbeariaRepository barbeariaRepository) {
        this.barbeariaRepository = barbeariaRepository;
    }

    // DTO (Data Transfer Object) para receber apenas as coordenadas
    @Getter
    @Setter
    public static class LocalizacaoDto {
        private Double latitude;
        private Double longitude;
    }
    
    // Método auxiliar para conversão de String para Double
    private Double parseDoubleSafe(String valueStr) {
        if (valueStr == null || valueStr.isEmpty()) {
            return null;
        }
        try {
            // Usa o ponto (.) como separador decimal, que é o padrão do Angular
            return Double.parseDouble(valueStr);
        } catch (NumberFormatException e) {
            // Em caso de erro de formato, retorna null
            System.err.println("Erro ao converter valor de coordenada: " + valueStr);
            return null;
        }
    }
    
    /**
     * Calcula a distância Haversine entre dois pontos de coordenadas (em km).
     * @param lat1 Latitude do ponto 1 (Cliente)
     * @param lon1 Longitude do ponto 1 (Cliente)
     * @param lat2 Latitude do ponto 2 (Barbearia)
     * @param lon2 Longitude do ponto 2 (Barbearia)
     * @return Distância em quilômetros ou Double.MAX_VALUE se alguma coordenada for nula.
     */
    private double calcularDistanciaHaversine(Double lat1, Double lon1, Double lat2, Double lon2) {
        // Se a localização do cliente ou da barbearia for nula, considera a distância máxima
        // para que esta barbearia vá para o final da lista.
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return Double.MAX_VALUE; 
        }

        // Conversão para radianos
        double latRad1 = lat1 * DEG_TO_RAD;
        double lonRad1 = lon1 * DEG_TO_RAD;
        double latRad2 = lat2 * DEG_TO_RAD;
        double lonRad2 = lon2 * DEG_TO_RAD;

        // Diferença entre as longitudes e latitudes
        double dLat = latRad2 - latRad1;
        double dLon = lonRad2 - lonRad1;

        // Fórmula de Haversine
        double a = Math.pow(Math.sin(dLat / 2), 2) + 
                   Math.pow(Math.sin(dLon / 2), 2) * Math.cos(latRad1) * Math.cos(latRad2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return RAIO_TERRA_KM * c;
    }

    // Método de mapeamento para DTO, que calcula a distância
    private BarbeariaComDistanciaDto toDto(Barbearia barbearia, Double clienteLat, Double clienteLon) {
        BarbeariaComDistanciaDto dto = new BarbeariaComDistanciaDto();
        dto.setIdBarbearia(barbearia.getIdBarbearia());
        dto.setNomeBarbearia(barbearia.getNomeBarbearia());
        dto.setEnderecoBarbearia(barbearia.getEnderecoBarbearia());
        dto.setDescricaoBarbearia(barbearia.getDescricaoBarbearia());
        dto.setEmailBarbearia(barbearia.getEmailBarbearia());
        dto.setFotoBarbearia(barbearia.getFotoBarbearia());
        dto.setLatitude(barbearia.getLatitude());
        dto.setLongitude(barbearia.getLongitude());

        if (clienteLat != null && clienteLon != null) {
            double distancia = calcularDistanciaHaversine(
                clienteLat, 
                clienteLon, 
                barbearia.getLatitude(), 
                barbearia.getLongitude()
            );
            
            // Se o valor for Double.MAX_VALUE (coordenada nula), não define a distância
            if (distancia != Double.MAX_VALUE) {
                // Arredonda para 1 casa decimal
                distancia = Math.round(distancia * 10.0) / 10.0;
                dto.setDistanciaKm(distancia);
            }
        }
        
        return dto;
    }


    // NOVO ENDPOINT: Atualiza apenas a Latitude e Longitude
    @PutMapping("/{id}/localizacao")
    public ResponseEntity<Barbearia> atualizarLocalizacao(
            @PathVariable Long id,
            @RequestBody LocalizacaoDto localizacaoDto) {

        Barbearia barbearia = barbeariaRepository.findById(id);

        if (barbearia == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Barbearia não encontrada.");
        }

        // 1. Atualiza apenas os campos de localização
        barbearia.setLatitude(localizacaoDto.getLatitude());
        barbearia.setLongitude(localizacaoDto.getLongitude());

        // 2. Chama o repository para persistir as mudanças
        int qtd = barbeariaRepository.update(barbearia);

        if (qtd != 1) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao atualizar localização.");
        }

        return ResponseEntity.ok(barbearia);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Barbearia> getById(@PathVariable Long id) {
        Barbearia barbearia = barbeariaRepository.findById(id);
        if (barbearia != null) {
            return ResponseEntity.ok().body(barbearia);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    // 💡 ENDPOINT REVISADO: Agora retorna uma lista de DTOs que incluem a distância
    @GetMapping({"", "/"})
    public ResponseEntity<List<BarbeariaComDistanciaDto>> getAll(
            @RequestParam(required = false) Double latitude, 
            @RequestParam(required = false) Double longitude
    ) {
        // 1. Busca todas as barbearias 
        List<Barbearia> barbearias = barbeariaRepository.findAll(); 
        
        // 2. Mapeia para DTOs e calcula a distância
        List<BarbeariaComDistanciaDto> barbeariasDto = barbearias.stream()
            .map(b -> toDto(b, latitude, longitude)) // Mapeia e calcula a distância
            .collect(Collectors.toList());
        
        // 3. Verifica se a localização do cliente foi fornecida para ordenar
        if (latitude != null && longitude != null) {
            // Se sim, ordena a lista usando a distância de Haversine (que está no DTO)
            barbeariasDto = barbeariasDto.stream()
                // Compara usando o campo distanciaKm. 
                // As barbearias sem distância (Double.MAX_VALUE) vão para o final
                .sorted(Comparator.comparingDouble(BarbeariaComDistanciaDto::getDistanciaKm))
                .collect(Collectors.toList());
        }
        
        return ResponseEntity.ok().body(barbeariasDto);
    }

    @PutMapping({"", "/"})
    public ResponseEntity<Barbearia> update(@RequestBody Barbearia barbearia) {
        if (barbearia.getIdBarbearia() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Barbearia not found");
        }

        int qtd = barbeariaRepository.update(barbearia);

        if (qtd == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhuma Barbearia alterada");
        }
        if (qtd > 1) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Foi alterado mais de 1 Barbearia.");
        }

        return ResponseEntity.ok().body(barbearia);
    }

    @PostMapping("/autenticar")
    public ResponseEntity<Barbearia> autenticar(@RequestBody Map<String, String> login) {
        String email = login.get("emailBarbearia");
        String senha = login.get("senhaBarbearia");

        if (email == null || senha == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email e senha são obrigatórios");
        }

        Barbearia barbearia = barbeariaRepository.findByEmailAndSenha(email, senha);
        if (barbearia != null) {
            return ResponseEntity.ok(barbearia);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PostMapping("/cadastrar")
    public ResponseEntity<Barbearia> cadastrar(@RequestBody Barbearia barbearia) {
        System.out.println(barbearia);
        if (barbearia.getNomeBarbearia() == null || barbearia.getEnderecoBarbearia() == null ||
            barbearia.getDescricaoBarbearia() == null || barbearia.getEmailBarbearia() == null ||
            barbearia.getSenhaBarbearia() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Todos os campos obrigatórios devem ser preenchidos");
        }

        // Se o cadastro for feito por aqui, a localização será NULL no banco (como configurado)
        Long id = barbeariaRepository.insert(barbearia);
        barbearia.setIdBarbearia(id);
        return ResponseEntity.ok().body(barbearia);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Barbearia> atualizar(@PathVariable Long id, @RequestBody Barbearia barbearia) {
        barbearia.setIdBarbearia(id);
        int qtd = barbeariaRepository.update(barbearia);

        if (qtd == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhuma Barbearia alterada");
        }
        if (qtd > 1) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Foi alterado mais de 1 Barbearia.");
        }

        return ResponseEntity.ok().body(barbearia);
    }

    @DeleteMapping("/excluir/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        int qtd = barbeariaRepository.delete(id);
        if (qtd == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhuma Barbearia excluída");
        }
        if (qtd > 1) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Mais de uma Barbearia foi excluída");
        }
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<BarbeariaComDistanciaDto>> buscarPorNome(@RequestParam String nome) {
        // Para consistência, também atualizamos o endpoint de busca para retornar o DTO,
        // mas a distância será nula, pois a localização do cliente não está disponível aqui.
        List<Barbearia> barbearias = barbeariaRepository.findByNome(nome);
        
        List<BarbeariaComDistanciaDto> barbeariasDto = barbearias.stream()
            .map(b -> toDto(b, null, null))
            .collect(Collectors.toList());

        return ResponseEntity.ok().body(barbeariasDto);
    }

    // --- ENDPOINT CORRIGIDO PARA RECEBER LATITUDE E LONGITUDE ---
    @PostMapping("/cadastrar-com-foto")
    public ResponseEntity<Barbearia> cadastrarComFoto(
            @RequestParam("nomeBarbearia") String nome,
            @RequestParam("emailBarbearia") String email,
            @RequestParam("senhaBarbearia") String senha,
            @RequestParam(value = "enderecoBarbearia", required = false) String endereco,
            @RequestParam("descricaoBarbearia") String descricao,
            // CORREÇÃO: Adicionando os parâmetros de localização
            @RequestParam(value = "latitude", required = false) String latitudeStr,
            @RequestParam(value = "longitude", required = false) String longitudeStr,
            @RequestParam(value = "fotoPerfil", required = false) MultipartFile foto) throws IOException {

        Barbearia b = new Barbearia();
        b.setNomeBarbearia(nome);
        b.setEmailBarbearia(email);
        b.setSenhaBarbearia(senha);
        b.setEnderecoBarbearia(endereco);
        b.setDescricaoBarbearia(descricao);

        // CORREÇÃO: Atribuindo os valores convertidos
        b.setLatitude(parseDoubleSafe(latitudeStr));
        b.setLongitude(parseDoubleSafe(longitudeStr));

        if (foto != null && !foto.isEmpty()) {
            b.setFotoBarbearia(foto.getBytes());
        }

        Long id = barbeariaRepository.insert(b);
        b.setIdBarbearia(id);

        return ResponseEntity.ok(b);
    }

    // --- ENDPOINT CORRIGIDO PARA RECEBER LATITUDE E LONGITUDE ---
    @PutMapping("/atualizar-com-foto/{id}")
    public ResponseEntity<Barbearia> atualizarComFoto(
            @PathVariable Long id,
            @RequestParam("nomeBarbearia") String nome,
            @RequestParam("emailBarbearia") String email,
            @RequestParam("senhaBarbearia") String senha,
            @RequestParam(value = "enderecoBarbearia", required = false) String endereco,
            @RequestParam("descricaoBarbearia") String descricao,
            // CORREÇÃO: Adicionando os parâmetros de localização
            @RequestParam(value = "latitude", required = false) String latitudeStr,
            @RequestParam(value = "longitude", required = false) String longitudeStr,
            @RequestParam(value = "fotoPerfil", required = false) MultipartFile foto) throws IOException {

        Barbearia b = barbeariaRepository.findById(id);
        if (b == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Barbearia não encontrada");

        b.setNomeBarbearia(nome);
        b.setEmailBarbearia(email);
        b.setSenhaBarbearia(senha);
        b.setEnderecoBarbearia(endereco);
        b.setDescricaoBarbearia(descricao);
        
        // CORREÇÃO: Atribuindo os valores convertidos
        b.setLatitude(parseDoubleSafe(latitudeStr));
        b.setLongitude(parseDoubleSafe(longitudeStr));

        if (foto != null && !foto.isEmpty()) {
            b.setFotoBarbearia(foto.getBytes());
        }

        int qtd = barbeariaRepository.update(b);
        if (qtd != 1) throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao atualizar");

        return ResponseEntity.ok(b);
    }

    @GetMapping("/buscar/{id}")
    public ResponseEntity<BarbeariaComDistanciaDto> buscarPorId(
            @PathVariable Long id,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude) {

        Barbearia barbearia = barbeariaRepository.findDtoById(id);
        if (barbearia == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Barbearia não encontrada.");
        }

        BarbeariaComDistanciaDto dto = toDto(barbearia, latitude, longitude);
        return ResponseEntity.ok(dto);
    }
}
