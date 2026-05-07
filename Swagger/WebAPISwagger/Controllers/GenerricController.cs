using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Model;
using Model.Context;

namespace WebAPISwagger.Controllers
{
    [Route("genericapi/[controller]")]
    [ApiController]
    public class GenericController<T> : ControllerBase where T : class, IHasId
    {
        private readonly DbContext _context;

        public GenericController(DbContext context)
        {
            _context = context;
        }
        
        [HttpGet]
        public async Task<ActionResult<IEnumerable<T>>> Get()
        {
            return await _context.Set<T>().ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<T>> Get(int id)
        {
            var t = await _context.Set<T>().FindAsync(id);

            if (t == null)
            {
                return NotFound();
            }

            return t;
        }
        
        [HttpPost]
        public async Task<ActionResult<T>> Post(T t)
        {
            _context.Set<T>().Add(t);
            await _context.SaveChangesAsync();

            return CreatedAtAction("Get", new { id = t.Id }, t); // Location Header
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, T t)
        {
            if (id != t.Id)
            {
                return BadRequest($"URL-ID ({id}) passt nicht zur Body-ID ({t.Id})");
            }

            _context.Entry(t).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Set<T>().Any(e=>e.Id==id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteT(int id)
        {
            var t = await _context.Set<T>().FindAsync(id);
            if (t == null)
            {
                return NotFound();
            }

            _context.Set<T>().Remove(t);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        private bool TExists(int id)
        {
            return _context.Set<T>().Any(e => e.Id == id);
        }
    }
    //ohne primary constructor
    public class DemosController : GenericController<Demos>
    {
        public DemosController(SwaggerContext context) : base(context){}
    }
    //mit primary constructor
    public class ExamplesController(SwaggerContext context) : GenericController<Example>(context);
    public class DogController(MyDbContext context) : GenericController<Dog>(context);
    public class BirdController(MyDbContext context) : GenericController<Bird>(context);
}