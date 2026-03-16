import React from 'react';
import DynamicCrud from '../../../components/dynamic/DynamicCrud';

const RegistroPersonasView: React.FC = () => {
    return (
        <DynamicCrud
            tableName="usuarios"
            overrideTitle="Registro Completo de Personas"
            immutableFields={['nit_entidad', 'id_rol', 'contrasena']}
            hideCreateForm={true}
            hiddenColumns={['contrasena', 'id_rol', 'nit_entidad', 'codigo_qr']}
        />
    );
};

export default RegistroPersonasView;
