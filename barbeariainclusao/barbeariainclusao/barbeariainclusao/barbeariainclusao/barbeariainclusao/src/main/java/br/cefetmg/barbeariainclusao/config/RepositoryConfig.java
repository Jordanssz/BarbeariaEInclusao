package br.cefetmg.barbeariainclusao.config;

import br.cefetmg.barbeariainclusao.repository.*;
import org.jdbi.v3.core.Jdbi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RepositoryConfig {

    @Bean
    public BarbeariaRepository barbeariaRepository(Jdbi jdbi) {
        return jdbi.onDemand(BarbeariaRepository.class);
    }

    @Bean
    public BarbeiroRepository barbeiroRepository(Jdbi jdbi) {
        return jdbi.onDemand(BarbeiroRepository.class);
    }

    @Bean
    public ServicoRepository servicoRepository(Jdbi jdbi) {
        return jdbi.onDemand(ServicoRepository.class);
    }

    @Bean
    public AtendimentoRepository atendimentoRepository(Jdbi jdbi) {
        return jdbi.onDemand(AtendimentoRepository.class);
    }

    @Bean
    public AvaliacaoRepository avaliacaoRepository(Jdbi jdbi) {
        return jdbi.onDemand(AvaliacaoRepository.class);
    }

    @Bean
    public BarbeariaCaracteristicaRepository barbeariaCaracteristicaRepository(Jdbi jdbi) {
        return jdbi.onDemand(BarbeariaCaracteristicaRepository.class);
    }

    @Bean
    public BarbeiroTagRepository barbeiroTagRepository(Jdbi jdbi) {
        return jdbi.onDemand(BarbeiroTagRepository.class);
    }

    @Bean
    public CaracteristicaRepository caracteristicaRepository(Jdbi jdbi) {
        return jdbi.onDemand(CaracteristicaRepository.class);
    }

    @Bean
    public DependenteRepository dependenteRepository(Jdbi jdbi) {
        return jdbi.onDemand(DependenteRepository.class);
    }

    @Bean
    public TagRepository tagRepository(Jdbi jdbi) {
        return jdbi.onDemand(TagRepository.class);
    }

    @Bean
    public UsuarioRepository usuarioRepository(Jdbi jdbi) {
        return jdbi.onDemand(UsuarioRepository.class);
    }

    @Bean
    public SolicitacaoRepository solicitacaoRepository(Jdbi jdbi) {
        return jdbi.onDemand(SolicitacaoRepository.class);
    }
}
