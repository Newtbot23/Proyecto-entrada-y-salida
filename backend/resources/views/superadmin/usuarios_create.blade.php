
    <input type="hidden" name="plan_id" value="{{ $plan_id ?? '' }}">

    <h3>metodos de pago</h3>

    <label>Plan Seleccionado</label><br>
    <input type="text" name="id_plan_lic" required><br><br>

    <label>Pago Mensual</label><br>
    <input type="email" name="id_plan_lic" required><br><br>

    <label>Metodo de pago</label><br>
    <input type="text" name="metodo_pago" required><br><br>

    <label>Referencia</label><br>
    <input type="text" name="referencia" required><br><br>


    <button type="submit">Registrar</button>
</form>
