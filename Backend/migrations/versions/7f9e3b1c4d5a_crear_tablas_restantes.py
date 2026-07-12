"""crear tablas restantes

Revision ID: 7f9e3b1c4d5a
Revises: d546a5b234f0
Create Date: 2026-07-10 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7f9e3b1c4d5a'
down_revision = 'd546a5b234f0'
branch_labels = None
depends_on = None


def upgrade():
    # --- Add rol to usuarios (missing from first migration) ---
    op.add_column('usuarios', sa.Column('rol', sa.String(length=20), nullable=False, server_default='estudiante'))
    op.alter_column('usuarios', 'password', type_=sa.String(length=255), existing_type=sa.String(length=100))

    # --- facultades ---
    op.create_table('facultades',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nombre', sa.String(length=100), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('modified_at', sa.DateTime(), nullable=True),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # --- especialidades ---
    op.create_table('especialidades',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('facultad_id', sa.Integer(), sa.ForeignKey('facultades.id'), nullable=True),
        sa.Column('nombre', sa.String(length=100), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('modified_at', sa.DateTime(), nullable=True),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # --- semestres ---
    op.create_table('semestres',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('codigo', sa.String(length=2), nullable=False, unique=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('modified_at', sa.DateTime(), nullable=True),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # --- periodos_academicos ---
    op.create_table('periodos_academicos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nombre', sa.String(length=10), nullable=True),
        sa.Column('fecha_inicio', sa.DateTime(), nullable=True),
        sa.Column('fecha_fin', sa.DateTime(), nullable=True),
        sa.Column('dias_limite_pago', sa.Integer(), nullable=False, server_default='15'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('modified_at', sa.DateTime(), nullable=True),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # --- plan_de_estudios ---
    op.create_table('plan_de_estudios',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('especialidad_id', sa.Integer(), sa.ForeignKey('especialidades.id'), nullable=True),
        sa.Column('anio_creacion', sa.Integer(), nullable=False),
        sa.Column('vigente', sa.Boolean(), nullable=False, server_default='1'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('modified_at', sa.DateTime(), nullable=True),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # --- tipos_docentes ---
    op.create_table('tipos_docentes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nombre', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('modified_at', sa.DateTime(), nullable=True),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # --- tipos_clasificaciones_merito ---
    op.create_table('tipos_clasificaciones_merito',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nombre', sa.String(length=50), nullable=False),
        sa.Column('porcentaje_limite', sa.Numeric(5, 2), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # --- estados_cursos ---
    op.create_table('estados_cursos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nombre', sa.String(length=30), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('modified_at', sa.DateTime(), nullable=True),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # --- estados_matriculas ---
    op.create_table('estados_matriculas',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nombre', sa.String(length=30), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('modified_at', sa.DateTime(), nullable=True),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # --- estados_permanencia_estudiante ---
    op.create_table('estados_permanencia_estudiante',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nombre', sa.String(length=50), nullable=False),
        sa.Column('descripcion', sa.String(length=250), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # --- cursos ---
    op.create_table('cursos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nombre', sa.String(length=100), nullable=False),
        sa.Column('codigo', sa.String(length=20), nullable=False, unique=True),
        sa.Column('creditos', sa.SmallInteger(), nullable=False),
        sa.Column('horas_lectivas', sa.SmallInteger(), nullable=False),
        sa.Column('horas_practicas', sa.SmallInteger(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('modified_at', sa.DateTime(), nullable=True),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # --- docentes ---
    op.create_table('docentes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('usuario_id', sa.Integer(), sa.ForeignKey('usuarios.id'), nullable=True),
        sa.Column('facultad_id', sa.Integer(), sa.ForeignKey('facultades.id'), nullable=True),
        sa.Column('nombres', sa.String(length=150), nullable=False),
        sa.Column('apellido_paterno', sa.String(length=150), nullable=False),
        sa.Column('apellido_materno', sa.String(length=150), nullable=False),
        sa.Column('dni', sa.CHAR(8), nullable=False),
        sa.Column('correo_institucional', sa.String(length=100), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('modified_at', sa.DateTime(), nullable=True),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # --- estudiantes ---
    op.create_table('estudiantes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('usuario_id', sa.Integer(), sa.ForeignKey('usuarios.id'), nullable=True),
        sa.Column('especialidad_id', sa.Integer(), sa.ForeignKey('especialidades.id'), nullable=True),
        sa.Column('nombres', sa.String(length=150), nullable=False),
        sa.Column('apellido_paterno', sa.String(length=150), nullable=False),
        sa.Column('apellido_materno', sa.String(length=150), nullable=False),
        sa.Column('dni', sa.CHAR(8), nullable=False),
        sa.Column('correo_institucional', sa.String(length=100), nullable=False),
        sa.Column('codigo', sa.String(length=20), nullable=True, unique=True),
        sa.Column('tiene_deuda_activa', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('tiene_sancion_activa', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('modified_at', sa.DateTime(), nullable=True),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # --- plan_estudiantes ---
    op.create_table('plan_estudiantes',
        sa.Column('estudiante_id', sa.Integer(), sa.ForeignKey('estudiantes.id'), primary_key=True),
        sa.Column('plan_estudios_id', sa.Integer(), sa.ForeignKey('plan_de_estudios.id'), primary_key=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('modified_at', sa.DateTime(), nullable=True),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
    )

    # --- pre_requisitos ---
    op.create_table('pre_requisitos',
        sa.Column('curso_dependiente_id', sa.Integer(), sa.ForeignKey('cursos.id'), primary_key=True),
        sa.Column('curso_requisito_id', sa.Integer(), sa.ForeignKey('cursos.id'), primary_key=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )

    # --- plan_cursos_semestre ---
    op.create_table('plan_cursos_semestre',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('plan_estudios_id', sa.Integer(), sa.ForeignKey('plan_de_estudios.id'), nullable=True),
        sa.Column('semestre_id', sa.Integer(), sa.ForeignKey('semestres.id'), nullable=True),
        sa.Column('curso_id', sa.Integer(), sa.ForeignKey('cursos.id'), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('modified_at', sa.DateTime(), nullable=True),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('plan_estudios_id', 'semestre_id', 'curso_id')
    )

    # --- secciones_curso ---
    op.create_table('secciones_curso',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('periodo_academico_id', sa.Integer(), sa.ForeignKey('periodos_academicos.id'), nullable=False),
        sa.Column('curso_id', sa.Integer(), sa.ForeignKey('cursos.id'), nullable=False),
        sa.Column('semestre_id', sa.Integer(), sa.ForeignKey('semestres.id'), nullable=False),
        sa.Column('cupos', sa.SmallInteger(), server_default='40'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('periodo_academico_id', 'curso_id', 'semestre_id')
    )

    # --- seccion_horarios ---
    op.create_table('seccion_horarios',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('seccion_curso_id', sa.Integer(), sa.ForeignKey('secciones_curso.id'), nullable=True),
        sa.Column('dia', sa.Integer(), nullable=True),
        sa.Column('hora_inicio', sa.Time(), nullable=True),
        sa.Column('hora_fin', sa.Time(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # --- seccion_docentes ---
    op.create_table('seccion_docentes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('seccion_curso_id', sa.Integer(), sa.ForeignKey('secciones_curso.id'), nullable=True),
        sa.Column('docente_id', sa.Integer(), sa.ForeignKey('docentes.id'), nullable=True),
        sa.Column('tipo_docente_id', sa.Integer(), sa.ForeignKey('tipos_docentes.id'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # --- matriculas ---
    op.create_table('matriculas',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('estudiante_id', sa.Integer(), sa.ForeignKey('estudiantes.id'), nullable=True),
        sa.Column('periodo_academico_id', sa.Integer(), sa.ForeignKey('periodos_academicos.id'), nullable=True),
        sa.Column('semestre_id', sa.Integer(), sa.ForeignKey('semestres.id'), nullable=True),
        sa.Column('estado_id', sa.Integer(), sa.ForeignKey('estados_matriculas.id'), nullable=True),
        sa.Column('pagado', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('modified_at', sa.DateTime(), nullable=True),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # --- matricula_detalle ---
    op.create_table('matricula_detalle',
        sa.Column('matricula_id', sa.Integer(), sa.ForeignKey('matriculas.id'), primary_key=True),
        sa.Column('seccion_curso_id', sa.Integer(), sa.ForeignKey('secciones_curso.id'), primary_key=True),
        sa.Column('nota_parcial', sa.Numeric(4, 2), nullable=True),
        sa.Column('nota_parcial2', sa.Numeric(4, 2), nullable=True),
        sa.Column('nota_practica', sa.Numeric(4, 2), nullable=True),
        sa.Column('nota_final', sa.Numeric(4, 2), nullable=True),
        sa.Column('estado_curso_id', sa.Integer(), sa.ForeignKey('estados_cursos.id'), nullable=False),
    )

    # --- historial_meritos ---
    op.create_table('historial_meritos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('estudiante_id', sa.Integer(), sa.ForeignKey('estudiantes.id'), nullable=True),
        sa.Column('periodo_academico_id', sa.Integer(), sa.ForeignKey('periodos_academicos.id'), nullable=True),
        sa.Column('semestre_id', sa.Integer(), sa.ForeignKey('semestres.id'), nullable=True),
        sa.Column('especialidad_id', sa.Integer(), sa.ForeignKey('especialidades.id'), nullable=True),
        sa.Column('promedio_ponderado_periodo', sa.Numeric(4, 2), nullable=False),
        sa.Column('creditos_matriculados_periodo', sa.SmallInteger(), nullable=False),
        sa.Column('creditos_aprobados_periodo', sa.SmallInteger(), nullable=False),
        sa.Column('orden_merito', sa.Integer(), nullable=False),
        sa.Column('tipo_clasificacion_id', sa.Integer(), sa.ForeignKey('tipos_clasificaciones_merito.id'), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('estudiante_id', 'periodo_academico_id')
    )

    # --- progreso_estudiante ---
    op.create_table('progreso_estudiante',
        sa.Column('estudiante_id', sa.Integer(), sa.ForeignKey('estudiantes.id'), primary_key=True),
        sa.Column('estado_permanencia_id', sa.Integer(), sa.ForeignKey('estados_permanencia_estudiante.id'), nullable=False),
        sa.Column('creditos_aprobados_acumulados', sa.SmallInteger(), nullable=False),
        sa.Column('promedio_ponderado_acumulado', sa.Numeric(4, 2), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
    )

    # --- auditorias ---
    op.create_table('auditorias',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('usuario_id', sa.Integer(), sa.ForeignKey('usuarios.id'), nullable=True),
        sa.Column('accion', sa.String(length=150), nullable=False),
        sa.Column('entidad', sa.String(length=50), nullable=True),
        sa.Column('entidad_id', sa.Integer(), nullable=True),
        sa.Column('detalle', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # --- certificados ---
    op.create_table('certificados',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('estudiante_id', sa.Integer(), sa.ForeignKey('estudiantes.id'), nullable=False),
        sa.Column('tipo', sa.String(length=50), nullable=False),
        sa.Column('ticket_codigo', sa.String(length=20), nullable=True, unique=True),
        sa.Column('estado', sa.String(length=50), nullable=False, server_default='Pendiente de Validación'),
        sa.Column('comprobante_pago_ruta', sa.String(length=255), nullable=True),
        sa.Column('motivo_rechazo', sa.Text(), nullable=True),
        sa.Column('hash_documento', sa.String(length=64), nullable=True),
        sa.Column('fecha_firma', sa.DateTime(), nullable=True),
        sa.Column('codigo_verificacion', sa.String(length=36), nullable=True, unique=True),
        sa.Column('autorizado', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('emitido', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('notificado_en', sa.DateTime(), nullable=True),
        sa.Column('notificado_asunto', sa.String(length=150), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # --- pagos (new model) ---
    op.create_table('pagos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('matricula_id', sa.Integer(), sa.ForeignKey('matriculas.id'), nullable=False),
        sa.Column('numero_operacion', sa.String(length=50), nullable=False),
        sa.Column('fecha_pago', sa.Date(), nullable=False),
        sa.Column('monto', sa.Numeric(10, 2), nullable=False),
        sa.Column('comprobante_ruta', sa.String(length=255), nullable=True),
        sa.Column('comprobante_nombre_original', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # --- actas (new model) ---
    op.create_table('actas',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('seccion_curso_id', sa.Integer(), sa.ForeignKey('secciones_curso.id'), nullable=False, unique=True),
        sa.Column('estado', sa.String(length=20), nullable=False, server_default='Abierta'),
        sa.Column('cerrada', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('cerrada_por', sa.Integer(), sa.ForeignKey('usuarios.id'), nullable=True),
        sa.Column('cerrada_en', sa.DateTime(), nullable=True),
        sa.Column('notas_publicadas', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('hash_auditoria', sa.String(length=64), nullable=True),
        sa.Column('fecha_cierre', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # --- expediente_semestral (new model) ---
    op.create_table('expediente_semestral',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('estudiante_id', sa.Integer(), sa.ForeignKey('estudiantes.id'), nullable=False),
        sa.Column('periodo_academico_id', sa.Integer(), sa.ForeignKey('periodos_academicos.id'), nullable=False),
        sa.Column('promedio_ponderado_semestral', sa.Numeric(4, 2), nullable=False),
        sa.Column('creditos_aprobados_semestre', sa.SmallInteger(), nullable=False),
        sa.Column('estado', sa.String(length=20), nullable=False, server_default='Consolidado'),
        sa.Column('fecha_consolidacion', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('estudiante_id', 'periodo_academico_id')
    )

    # --- hitos_academicos (new model) ---
    op.create_table('hitos_academicos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('periodo_academico_id', sa.Integer(), sa.ForeignKey('periodos_academicos.id'), nullable=False),
        sa.Column('tipo_nota', sa.String(length=20), nullable=False),
        sa.Column('fecha_limite', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # --- permisos_rol (new model) ---
    op.create_table('permisos_rol',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('rol', sa.String(length=20), nullable=False),
        sa.Column('recurso', sa.String(length=50), nullable=False),
        sa.Column('puede_crear', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('puede_leer', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('puede_actualizar', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('puede_eliminar', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('puede_ejecutar_batch', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('rol', 'recurso', name='uq_permisos_rol_recurso')
    )

    # --- configuracion_ciclo_global (new model) ---
    op.create_table('configuracion_ciclo_global',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('periodo_academico_id', sa.Integer(), sa.ForeignKey('periodos_academicos.id'), nullable=True),
        sa.Column('estado_ciclo', sa.String(length=60), server_default='Planificacion Horaria'),
        sa.Column('fecha_cierre_matricula', sa.DateTime(), nullable=True),
        sa.Column('fecha_limite_notas', sa.DateTime(), nullable=True),
        sa.Column('fecha_cierre_actas', sa.DateTime(), nullable=True),
        sa.Column('actualizado_en', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # --- silabos (new model) ---
    op.create_table('silabos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('seccion_curso_id', sa.Integer(), sa.ForeignKey('secciones_curso.id'), nullable=False, unique=True),
        sa.Column('nombre_archivo', sa.String(length=255), nullable=False),
        sa.Column('ruta_archivo', sa.String(length=500), nullable=False),
        sa.Column('subido_en', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    op.drop_table('silabos')
    op.drop_table('configuracion_ciclo_global')
    op.drop_table('permisos_rol')
    op.drop_table('hitos_academicos')
    op.drop_table('expediente_semestral')
    op.drop_table('actas')
    op.drop_table('pagos')
    op.drop_table('certificados')
    op.drop_table('auditorias')
    op.drop_table('progreso_estudiante')
    op.drop_table('historial_meritos')
    op.drop_table('matricula_detalle')
    op.drop_table('matriculas')
    op.drop_table('seccion_docentes')
    op.drop_table('seccion_horarios')
    op.drop_table('secciones_curso')
    op.drop_table('plan_cursos_semestre')
    op.drop_table('pre_requisitos')
    op.drop_table('plan_estudiantes')
    op.drop_table('estudiantes')
    op.drop_table('docentes')
    op.drop_table('cursos')
    op.drop_table('estados_permanencia_estudiante')
    op.drop_table('estados_matriculas')
    op.drop_table('estados_cursos')
    op.drop_table('tipos_clasificaciones_merito')
    op.drop_table('tipos_docentes')
    op.drop_table('plan_de_estudios')
    op.drop_table('periodos_academicos')
    op.drop_table('semestres')
    op.drop_table('especialidades')
    op.drop_table('facultades')
    op.alter_column('usuarios', 'password', type_=sa.String(length=100), existing_type=sa.String(length=255))
    op.drop_column('usuarios', 'rol')
