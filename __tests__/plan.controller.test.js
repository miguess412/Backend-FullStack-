const planController = require('../src/infrastructure/http/controllers/plan.controller');
const { Plan } = require('../src/domain/entities');

jest.mock('../src/domain/entities', () => ({
    Plan: {
        findAll: jest.fn(),
        findByPk: jest.fn(),
        create: jest.fn()
    }
}));

describe('Plan Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: {},
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('getPlanes', () => {
        it('debe retornar todos los planes con estado 200', async () => {
            const mockPlanes = [{ id: 1, nombre: 'Plan 1' }, { id: 2, nombre: 'Plan 2' }];
            Plan.findAll.mockResolvedValue(mockPlanes);

            await planController.getPlanes(req, res);

            expect(Plan.findAll).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(mockPlanes);
        });

        it('debe retornar 500 si ocurre un error', async () => {
            Plan.findAll.mockRejectedValue(new Error('DB Error'));

            await planController.getPlanes(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Error del servidor' });
        });
    });

    describe('getPlanById', () => {
        it('debe retornar el plan si existe', async () => {
            req.params.id = 1;
            const mockPlan = { id: 1, nombre: 'Plan 1' };
            Plan.findByPk.mockResolvedValue(mockPlan);

            await planController.getPlanById(req, res);

            expect(Plan.findByPk).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith(mockPlan);
        });

        it('debe retornar 404 si el plan no existe', async () => {
            req.params.id = 999;
            Plan.findByPk.mockResolvedValue(null);

            await planController.getPlanById(req, res);

            expect(Plan.findByPk).toHaveBeenCalledWith(999);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Plan no encontrado' });
        });

        it('debe retornar 500 si ocurre un error', async () => {
            req.params.id = 1;
            Plan.findByPk.mockRejectedValue(new Error('DB Error'));

            await planController.getPlanById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Error del servidor' });
        });
    });

    describe('crearPlan', () => {
        it('debe crear un nuevo plan y retornar 201', async () => {
            req.body = { nombre: 'Nuevo Plan', velocidad: '50 Mbps', precio: 30 };
            const mockPlan = { id: 3, ...req.body };
            Plan.create.mockResolvedValue(mockPlan);

            await planController.crearPlan(req, res);

            expect(Plan.create).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockPlan);
        });

        it('debe retornar 500 si ocurre un error al crear', async () => {
            Plan.create.mockRejectedValue(new Error('DB Error'));

            await planController.crearPlan(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Error del servidor' });
        });
    });

    describe('actualizarPlan', () => {
        it('debe retornar 404 si el plan no existe', async () => {
            req.params.id = 999;
            Plan.findByPk.mockResolvedValue(null);

            await planController.actualizarPlan(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Plan no encontrado' });
        });

        it('debe actualizar el plan si existe', async () => {
            req.params.id = 1;
            req.body = { nombre: 'Plan Editado' };
            const mockPlan = {
                id: 1,
                nombre: 'Plan Original',
                update: jest.fn().mockResolvedValue(true)
            };
            Plan.findByPk.mockResolvedValue(mockPlan);

            await planController.actualizarPlan(req, res);

            expect(mockPlan.update).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalled();
        });

        it('debe retornar 500 si ocurre un error al actualizar', async () => {
            req.params.id = 1;
            Plan.findByPk.mockRejectedValue(new Error('DB Error'));

            await planController.actualizarPlan(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Error del servidor' });
        });
    });

    describe('eliminarPlan', () => {
        it('debe retornar 404 si el plan no existe', async () => {
            req.params.id = 999;
            Plan.findByPk.mockResolvedValue(null);

            await planController.eliminarPlan(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Plan no encontrado' });
        });

        it('debe desactivar el plan (soft delete)', async () => {
            req.params.id = 1;
            const mockPlan = {
                id: 1,
                nombre: 'Plan a eliminar',
                update: jest.fn().mockResolvedValue(true)
            };
            Plan.findByPk.mockResolvedValue(mockPlan);

            await planController.eliminarPlan(req, res);

            expect(mockPlan.update).toHaveBeenCalledWith({ activo: false });
            expect(res.json).toHaveBeenCalledWith({ message: 'Plan desactivado correctamente' });
        });

        it('debe retornar 500 si ocurre un error al eliminar', async () => {
            req.params.id = 1;
            Plan.findByPk.mockRejectedValue(new Error('DB Error'));

            await planController.eliminarPlan(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Error del servidor' });
        });
    });
});
